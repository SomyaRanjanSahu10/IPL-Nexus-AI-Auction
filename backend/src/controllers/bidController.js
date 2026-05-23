const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const Team = require('../models/Team');
const { getIO } = require('../socket/socketManager');

// POST /api/bids
const placeBid = async (req, res) => {
  try {
    const { auctionId, playerId, amount } = req.body;
    const user = req.user;
    const assignedTeamId = user.team?._id || user.team;

    const team = assignedTeamId
      ? await Team.findById(assignedTeamId)
      : await Team.findOne({ owner: user._id });

    if (!team) {
      return res.status(403).json({ error: 'You must be assigned to a team to bid' });
    }

    const teamId = team._id;
    const auction = await Auction.findById(auctionId);

    if (!auction || auction.status !== 'active') {
      return res.status(400).json({ error: 'Auction is not active' });
    }

    if (auction.currentPlayer?.toString() !== playerId) {
      return res.status(400).json({ error: 'This player is not currently up for auction' });
    }

    const expectedAmount = parseFloat((auction.currentBid.amount + auction.bidIncrement).toFixed(2));
    if (Math.abs(amount - expectedAmount) > 0.01) {
      return res.status(400).json({ error: `Bid must be ₹${expectedAmount} Cr` });
    }

    if (team.purseRemaining < amount) {
      return res.status(400).json({
        error: `Insufficient purse. You have ₹${team.purseRemaining.toFixed(2)} Cr remaining`
      });
    }

    if (auction.currentBid.team?.toString() === teamId.toString()) {
      return res.status(400).json({ error: 'You are already the highest bidder' });
    }

    // Count existing bids for this player
    const bidCount = await Bid.countDocuments({ auction: auctionId, player: playerId });

    const bid = await Bid.create({
      auction: auctionId,
      player: playerId,
      team: teamId,
      bidder: user._id,
      amount,
      bidNumber: bidCount + 1
    });

    // Update auction current bid
    auction.currentBid = { amount, team: teamId, bidder: user._id };
    await auction.save();

    const populatedBid = await Bid.findById(bid._id)
      .populate('team', 'name shortName primaryColor')
      .populate('bidder', 'name');

    // Broadcast new bid
    getIO().emit('auction:new_bid', {
      bid: populatedBid,
      currentBid: { amount, team: populatedBid.team }
    });

    res.status(201).json({ success: true, bid: populatedBid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/bids/player/:playerId
const getPlayerBids = async (req, res) => {
  try {
    const { auctionId } = req.query;
    const bids = await Bid.find({
      player: req.params.playerId,
      ...(auctionId && { auction: auctionId })
    })
      .populate('team', 'name shortName primaryColor')
      .populate('bidder', 'name')
      .sort('createdAt');

    res.json({ success: true, bids });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/bids/team/:teamId
const getTeamBids = async (req, res) => {
  try {
    const bids = await Bid.find({ team: req.params.teamId, isWinningBid: true })
      .populate('player', 'name role country emoji')
      .sort('-createdAt');
    res.json({ success: true, bids });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { placeBid, getPlayerBids, getTeamBids };
