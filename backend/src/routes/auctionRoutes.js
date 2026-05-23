// auctionRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auctionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, ctrl.getAllAuctions);
router.get('/active', ctrl.getActiveAuction);
router.post('/', protect, adminOnly, ctrl.createAuction);
router.post('/:id/start', protect, adminOnly, ctrl.startAuction);
router.post('/:id/pause', protect, adminOnly, ctrl.pauseAuction);
router.post('/:id/resume', protect, adminOnly, ctrl.resumeAuction);
router.post('/:id/next-player', protect, adminOnly, ctrl.nextPlayer);
router.post('/:id/sold', protect, adminOnly, ctrl.markSold);
router.post('/:id/unsold', protect, adminOnly, ctrl.markUnsold);
router.get('/:id/results', protect, ctrl.getResults);

module.exports = router;
