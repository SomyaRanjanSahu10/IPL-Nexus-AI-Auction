const axios = require('axios');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Auction = require('../models/Auction');

// Auto-detect API provider based on key prefix
const apiKey = process.env.GROK_API_KEY || '';
const isGroq = apiKey.startsWith('gsk_');
const GROK_API_URL = process.env.GROK_API_URL ||
  (isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions');
const GROK_MODEL = process.env.GROK_MODEL ||
  (isGroq ? 'llama-3.3-70b-versatile' : 'grok-beta');

// Core GROK API call
const callGrokAPI = async (messages, systemPrompt, maxTokens = 500) => {
  if (!apiKey) {
    throw new Error('GROK_API_KEY not configured');
  }

  const response = await axios.post(
    GROK_API_URL,
    {
      model: GROK_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  return response.data.choices[0].message.content;
};

// Build auction context string
const buildAuctionContext = async (userId) => {
  const [teams, auction] = await Promise.all([
    Team.find().populate('players', 'name role country basePrice soldPrice'),
    Auction.findOne({ status: { $in: ['active', 'paused'] } }).populate('currentPlayer currentBid.team')
  ]);

  const teamsCtx = teams.map(t =>
    `${t.shortName}(${t.name}): purse=₹${t.purseRemaining.toFixed(1)}Cr, players=${t.players.length}, overseas=${t.overseasCount}`
  ).join('\n');

  const currentPlayerCtx = auction?.currentPlayer
    ? `Current player: ${auction.currentPlayer.name}, role=${auction.currentPlayer.role}, base=₹${auction.currentPlayer.basePrice}Cr, currentBid=₹${auction.currentBid?.amount?.toFixed(2)}Cr, leader=${auction.currentBid?.team?.name || 'none'}`
    : 'No player currently up for auction.';

  return { teamsCtx, currentPlayerCtx, auction };
};

// POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const { teamsCtx, currentPlayerCtx } = await buildAuctionContext(req.user._id);

    const systemPrompt = `You are NEXUS AI, an expert IPL auction strategist for the IPL Nexus platform.

LIVE AUCTION STATUS:
${currentPlayerCtx}

TEAM PURSE STATUS:
${teamsCtx}

RULES: ₹100 Cr starting purse, ₹0.15 Cr bid increments, 10-second timer, max 8 overseas players per team.

Respond as a sharp, concise cricket analyst. Use ₹ for rupees (Cr = Crore). Max 3-4 sentences unless asked for more detail. Be direct and strategic.`;

    const messages = [
      ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const reply = await callGrokAPI(messages, systemPrompt);

    res.json({ success: true, reply });
  } catch (error) {
    if (error.message === 'GROK_API_KEY not configured') {
      return res.status(503).json({ error: 'AI service not configured. Please set GROK_API_KEY.' });
    }
    res.status(500).json({ error: `AI service error: ${error.message}` });
  }
};

// POST /api/ai/player-analysis
const analyzePlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const { teamsCtx } = await buildAuctionContext(req.user._id);

    const systemPrompt = `You are NEXUS AI, expert IPL auction analyst. Analyze players concisely.`;

    const userMessage = `Analyze this IPL auction player:
Name: ${player.name}
Role: ${player.role}
Country: ${player.country} (${player.isOverseas ? 'Overseas' : 'Domestic'})
Base Price: ₹${player.basePrice} Cr
IPL Stats: ${player.iplStats.matches} matches, ${player.iplStats.runs} runs, ${player.iplStats.strikeRate} SR, ${player.iplStats.wickets} wickets, ${player.iplStats.economy} economy
Injury: ${player.injuryStatus}
Demand: ${player.demandLevel}

Team purse context:
${teamsCtx}

Provide: (1) Market value prediction, (2) Which teams should target this player, (3) Bidding strategy, (4) Risk assessment. Be concise.`;

    const analysis = await callGrokAPI([{ role: 'user', content: userMessage }], systemPrompt, 400);

    // Update predicted value
    const valueMatch = analysis.match(/₹(\d+(?:\.\d+)?)\s*(?:to|-)?\s*₹?(\d+(?:\.\d+)?)?/);
    if (valueMatch) {
      const avgVal = valueMatch[2]
        ? (parseFloat(valueMatch[1]) + parseFloat(valueMatch[2])) / 2
        : parseFloat(valueMatch[1]);
      await Player.findByIdAndUpdate(playerId, { aiPredictedValue: avgVal });
    }

    res.json({ success: true, analysis, player: player.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/squad-recommendation
const squadRecommendation = async (req, res) => {
  try {
    const { teamId } = req.params;
    const [team, availablePlayers] = await Promise.all([
      Team.findById(teamId).populate('players', 'name role country isOverseas soldPrice'),
      Player.find({ auctionStatus: 'available' }).sort('basePrice').limit(30)
    ]);

    if (!team) return res.status(404).json({ error: 'Team not found' });

    const systemPrompt = `You are NEXUS AI, IPL squad-building expert.`;

    const userMessage = `My team: ${team.name}
Purse remaining: ₹${team.purseRemaining.toFixed(1)} Cr
Current squad (${team.players.length} players): ${team.players.map(p => `${p.name}(${p.role})`).join(', ')}
Overseas slots used: ${team.overseasCount}/8

Available players (sample):
${availablePlayers.slice(0, 15).map(p => `${p.name} - ${p.role} - ${p.country} - Base: ₹${p.basePrice}Cr`).join('\n')}

Analyze squad gaps and recommend top 5 targets with budget strategy. Be specific.`;

    const recommendation = await callGrokAPI([{ role: 'user', content: userMessage }], systemPrompt, 500);

    res.json({ success: true, recommendation, team: team.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/commentary
const generateCommentary = async (req, res) => {
  try {
    const { event, data } = req.body;
    // event: 'bid_placed' | 'sold' | 'unsold' | 'bidding_war' | 'player_up'

    const systemPrompt = `You are a live IPL auction commentator. Generate exciting, brief commentary (1-2 sentences max). Be dramatic but factual. Use cricket/auction terminology.`;

    const prompts = {
      bid_placed: `${data.team} just bid ₹${data.amount} Cr for ${data.player}. Generate commentary.`,
      sold: `${data.player} SOLD to ${data.team} for ₹${data.amount} Cr! Generate dramatic sold commentary.`,
      unsold: `${data.player} went UNSOLD at base price ₹${data.basePrice} Cr. Generate commentary.`,
      bidding_war: `Bidding war between ${data.teams?.join(' and ')} for ${data.player} at ₹${data.amount} Cr. Commentary.`,
      player_up: `${data.player} (${data.role}, ${data.country}) is up for auction with base price ₹${data.basePrice} Cr. Intro.`
    };

    const message = prompts[event] || `Auction event: ${JSON.stringify(data)}. Generate commentary.`;
    const commentary = await callGrokAPI([{ role: 'user', content: message }], systemPrompt, 100);

    res.json({ success: true, commentary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/ai/budget-optimizer/:teamId
const budgetOptimizer = async (req, res) => {
  try {
    const { teamId } = req.params;
    const [team, availablePlayers] = await Promise.all([
      Team.findById(teamId).populate('players', 'name role country'),
      Player.find({ auctionStatus: 'available' }).sort('-popularityScore').limit(40)
    ]);

    const systemPrompt = `You are NEXUS AI, IPL budget optimization expert.`;

    const userMessage = `Team: ${team.name}, Purse: ₹${team.purseRemaining.toFixed(1)} Cr, Players needed: ${25 - team.players.length}

Current roles: BAT=${team.stats.battersCount}, BOWL=${team.stats.bowlersCount}, ALL=${team.stats.allRoundersCount}, WK=${team.stats.wicketKeepersCount}

Available players:
${availablePlayers.slice(0, 20).map(p => `${p.name}(${p.role},${p.isOverseas ? 'OS' : 'DOM'},₹${p.basePrice}Cr,demand=${p.demandLevel})`).join('\n')}

Create an optimal budget allocation strategy. Prioritize by role needs, suggest price targets, and identify smart value picks.`;

    const strategy = await callGrokAPI([{ role: 'user', content: userMessage }], systemPrompt, 600);
    res.json({ success: true, strategy, team: team.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { chat, analyzePlayer, squadRecommendation, generateCommentary, budgetOptimizer };
