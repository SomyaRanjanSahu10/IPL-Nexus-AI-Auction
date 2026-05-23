const Auction = require('../models/Auction');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Bid = require('../models/Bid');
const { getIO } = require('../socket/socketManager');

// GET /api/auction/active
const getActiveAuction = async (req, res) => {
  try {
    const auction = await Auction.findOne({ status: { $in: ['active', 'paused'] } })
      .populate('currentPlayer')
      .populate('currentBid.team', 'name shortName primaryColor')
      .populate('currentBid.bidder', 'name');

    if (!auction) {
      return res.status(404).json({ error: 'No active auction found' });
    }

    res.json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/auction
const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    res.json({ success: true, auctions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/auction
const createAuction = async (req, res) => {
  try {
    const { name, season, timerDuration, bidIncrement } = req.body;

    const existing = await Auction.findOne({ status: { $in: ['active', 'paused'] } });
    if (existing) {
      return res.status(400).json({ error: 'An auction is already active. Complete it first.' });
    }

    const totalPlayers = await Player.countDocuments({ auctionStatus: 'available' });

    const auction = await Auction.create({
      name: name || 'IPL Mega Auction 2025',
      season: season || '2025',
      timerDuration: timerDuration || 10,
      bidIncrement: bidIncrement || 0.15,
      createdBy: req.user._id,
      stats: { totalPlayers }
    });

    res.status(201).json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/auction/:id/start
const startAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    if (auction.status === 'completed') return res.status(400).json({ error: 'Auction already completed' });

    // Get first available player
    const firstPlayer = await Player.findOne({ auctionStatus: 'available' }).sort('order');
    if (!firstPlayer) return res.status(400).json({ error: 'No available players to auction' });

    auction.status = 'active';
    auction.startedAt = new Date();
    auction.currentPlayer = firstPlayer._id;
    auction.currentBid = { amount: firstPlayer.basePrice, team: null, bidder: null };
    await auction.save();

    const populatedAuction = await Auction.findById(auction._id).populate('currentPlayer');

    // Broadcast to all clients
    getIO().emit('auction:started', { auction: populatedAuction });
    getIO().emit('auction:player_up', {
      player: firstPlayer,
      basePrice: firstPlayer.basePrice,
      currentBid: auction.currentBid
    });

    res.json({ success: true, auction: populatedAuction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/auction/:id/pause
const pauseAuction = async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.id,
      { status: 'paused' },
      { new: true }
    );
    getIO().emit('auction:paused', { auctionId: req.params.id });
    res.json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/auction/:id/resume
const resumeAuction = async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).populate('currentPlayer');
    getIO().emit('auction:resumed', { auction });
    res.json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/auction/:id/next-player
const nextPlayer = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    const nextAvailable = await Player.findOne({
      auctionStatus: 'available',
      _id: { $ne: auction.currentPlayer }
    }).sort('order');

    if (!nextAvailable) {
      // No more players - complete auction
      auction.status = 'completed';
      auction.completedAt = new Date();
      await auction.save();
      getIO().emit('auction:completed', { auctionId: auction._id });
      return res.json({ success: true, message: 'Auction completed', completed: true });
    }

    auction.currentPlayer = nextAvailable._id;
    auction.currentBid = { amount: nextAvailable.basePrice, team: null, bidder: null };
    await auction.save();

    getIO().emit('auction:player_up', {
      player: nextAvailable,
      basePrice: nextAvailable.basePrice,
      currentBid: auction.currentBid
    });

    res.json({ success: true, player: nextAvailable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/auction/:id/sold
const markSold = async (req, res) => {
  try {
    const { playerId } = req.body;
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    const teamId = req.body.teamId || auction.currentBid?.team;
    const amount = req.body.amount || auction.currentBid?.amount;

    if (!playerId) return res.status(400).json({ error: 'Player is required' });
    if (!teamId) return res.status(400).json({ error: 'No leading bidder. Mark player as unsold instead.' });
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid sold amount' });
    if (auction.currentPlayer?.toString() !== playerId.toString()) {
      return res.status(400).json({ error: 'This player is not currently up for auction' });
    }

    const [player, team] = await Promise.all([
      Player.findById(playerId),
      Team.findById(teamId)
    ]);

    if (!player || !team) return res.status(404).json({ error: 'Player or team not found' });
    if (player.auctionStatus === 'sold') return res.status(400).json({ error: 'Player is already sold' });
    if (team.purseRemaining < amount) return res.status(400).json({ error: 'Insufficient purse' });

    // Update player
    player.auctionStatus = 'sold';
    player.soldTo = teamId;
    player.soldPrice = amount;
    await player.save();

    // Update team
    team.purseRemaining = parseFloat((team.purseRemaining - amount).toFixed(2));
    team.players.push(playerId);
    team.stats.totalSpent += amount;
    if (player.isOverseas) team.overseasCount += 1;
    if (player.role === 'BAT') team.stats.battersCount++;
    else if (player.role === 'BOWL') team.stats.bowlersCount++;
    else if (player.role === 'ALL') team.stats.allRoundersCount++;
    else team.stats.wicketKeepersCount++;
    await team.save();

    // Update auction stats
    auction.stats.soldPlayers += 1;
    auction.stats.totalAmountSpent += amount;
    if (amount > auction.stats.highestSale.amount) {
      auction.stats.highestSale = { player: playerId, amount, team: teamId };
    }
    await auction.save();

    // Mark all bids for this player
    await Bid.updateMany(
      { auction: auction._id, player: playerId },
      { isWinningBid: false }
    );
    await Bid.findOneAndUpdate(
      { auction: auction._id, player: playerId, team: teamId, amount },
      { isWinningBid: true }
    );

    const populatedTeam = await Team.findById(teamId).populate('players', 'name role country');

    getIO().emit('auction:sold', {
      player: { id: playerId, name: player.name },
      team: { id: teamId, name: team.name, shortName: team.shortName },
      amount,
      teamPurse: team.purseRemaining
    });

    res.json({ success: true, player, team: populatedTeam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/auction/:id/unsold
const markUnsold = async (req, res) => {
  try {
    const { playerId } = req.body;
    await Player.findByIdAndUpdate(playerId, { auctionStatus: 'unsold' });

    const auction = await Auction.findById(req.params.id);
    auction.stats.unsoldPlayers += 1;
    await auction.save();

    getIO().emit('auction:unsold', { playerId });
    res.json({ success: true, message: 'Player marked as unsold' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/auction/:id/results
const getResults = async (req, res) => {
  try {
    const [auction, soldPlayers, unsoldPlayers, teams, bids] = await Promise.all([
      Auction.findById(req.params.id).populate('stats.highestSale.player stats.highestSale.team'),
      Player.find({ auctionStatus: 'sold' }).populate('soldTo', 'name shortName primaryColor'),
      Player.find({ auctionStatus: 'unsold' }),
      Team.find().populate('players', 'name role country basePrice soldPrice'),
      Bid.find({ auction: req.params.id }).countDocuments()
    ]);

    res.json({
      success: true,
      auction,
      soldPlayers,
      unsoldPlayers,
      teams,
      totalBids: bids
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getActiveAuction, getAllAuctions, createAuction,
  startAuction, pauseAuction, resumeAuction,
  nextPlayer, markSold, markUnsold, getResults
};
