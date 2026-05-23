const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'IPL Mega Auction 2025'
  },
  season: { type: String, default: '2025' },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  currentPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  },
  currentBid: {
    amount: { type: Number, default: 0 },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  timerDuration: { type: Number, default: 10 },
  bidIncrement: { type: Number, default: 0.15 },
  stats: {
    totalPlayers: { type: Number, default: 0 },
    soldPlayers: { type: Number, default: 0 },
    unsoldPlayers: { type: Number, default: 0 },
    totalAmountSpent: { type: Number, default: 0 },
    highestSale: {
      player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
      amount: { type: Number, default: 0 },
      team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null }
    }
  },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

const Auction = mongoose.model('Auction', auctionSchema);
module.exports = Auction;
