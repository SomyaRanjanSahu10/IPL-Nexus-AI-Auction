const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Player = require('../models/Player');
const Bid = require('../models/Bid');
const { protect } = require('../middleware/authMiddleware');

// GET /api/analytics/overview
router.get('/overview', protect, async (req, res) => {
  try {
    const [teams, soldPlayers, unsoldPlayers, totalBids] = await Promise.all([
      Team.find().select('name shortName purseRemaining stats primaryColor').sort('-stats.totalSpent'),
      Player.countDocuments({ auctionStatus: 'sold' }),
      Player.countDocuments({ auctionStatus: 'unsold' }),
      Bid.countDocuments()
    ]);

    const totalSpent = teams.reduce((s, t) => s + t.stats.totalSpent, 0);
    const mostExpensive = await Player.findOne({ auctionStatus: 'sold' })
      .sort('-soldPrice').populate('soldTo', 'name shortName');

    res.json({
      success: true,
      overview: {
        totalTeams: teams.length,
        soldPlayers,
        unsoldPlayers,
        totalBids,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        mostExpensivePlayer: mostExpensive
      },
      teams: teams.map(t => ({
        id: t._id,
        name: t.name,
        shortName: t.shortName,
        purseRemaining: t.purseRemaining ?? 100,
        totalSpent: t.stats?.totalSpent || 0,
        primaryColor: t.primaryColor,
        playerBreakdown: {
          batters: t.stats?.battersCount || 0,
          bowlers: t.stats?.bowlersCount || 0,
          allRounders: t.stats?.allRoundersCount || 0,
          keepers: t.stats?.wicketKeepersCount || 0
        }
      }))
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/analytics/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const soldPlayers = await Player.find({ auctionStatus: 'sold' })
      .populate('soldTo', 'name shortName primaryColor')
      .sort('-soldPrice')
      .limit(20);

    res.json({ success: true, leaderboard: soldPlayers });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
