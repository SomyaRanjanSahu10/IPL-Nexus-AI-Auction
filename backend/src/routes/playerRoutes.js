const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET all players with filters
router.get('/', async (req, res) => {
  try {
    const { status, role, country, search, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (status) filter.auctionStatus = status;
    if (role) filter.role = role;
    if (country) filter.country = new RegExp(country, 'i');
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [players, total] = await Promise.all([
      Player.find(filter).populate('soldTo', 'name shortName primaryColor').sort('order').skip(skip).limit(parseInt(limit)),
      Player.countDocuments(filter)
    ]);

    res.json({ success: true, players, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET single player
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('soldTo', 'name shortName primaryColor');
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json({ success: true, player });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create player (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json({ success: true, player });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// PUT update player (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, player });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE player (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Player.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Player deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
