// bidRoutes.js
const express = require('express');
const bidRouter = express.Router();
const { placeBid, getPlayerBids, getTeamBids } = require('../controllers/bidController');
const { protect, teamOwnerOnly } = require('../middleware/authMiddleware');

bidRouter.post('/', protect, teamOwnerOnly, placeBid);
bidRouter.get('/player/:playerId', protect, getPlayerBids);
bidRouter.get('/team/:teamId', protect, getTeamBids);

module.exports = bidRouter;
