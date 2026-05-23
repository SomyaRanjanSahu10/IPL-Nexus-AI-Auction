const express = require('express');
const router = express.Router();
const { chat, analyzePlayer, squadRecommendation, generateCommentary, budgetOptimizer } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, chat);
router.get('/analyze/:playerId', protect, analyzePlayer);
router.get('/squad/:teamId', protect, squadRecommendation);
router.post('/commentary', generateCommentary);
router.get('/budget/:teamId', protect, budgetOptimizer);

module.exports = router;
