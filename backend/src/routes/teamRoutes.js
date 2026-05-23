const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .populate('owner', 'name email')
      .populate('players', 'name role country emoji isOverseas soldPrice')
      .sort('name');
    res.json({ success: true, teams });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET single team
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('players', 'name role country emoji isOverseas soldPrice iplStats');
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({ success: true, team });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT update team (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, team });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST assign owner
router.post('/:id/assign-owner', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.body;
    const User = require('../models/User');
    await Promise.all([
      Team.findByIdAndUpdate(req.params.id, { owner: userId }),
      User.findByIdAndUpdate(userId, { team: req.params.id, role: 'team_owner' })
    ]);
    res.json({ success: true, message: 'Owner assigned' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST reset team purse (admin)
router.post('/:id/reset', protect, adminOnly, async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, {
      purseRemaining: 100,
      players: [],
      overseasCount: 0,
      'stats.totalSpent': 0,
      'stats.battersCount': 0,
      'stats.bowlersCount': 0,
      'stats.allRoundersCount': 0,
      'stats.wicketKeepersCount': 0
    }, { new: true });
    res.json({ success: true, team });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
