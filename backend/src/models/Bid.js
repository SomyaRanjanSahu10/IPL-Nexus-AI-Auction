const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  isWinningBid: {
    type: Boolean,
    default: false
  },
  bidNumber: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

bidSchema.index({ auction: 1, player: 1 });
bidSchema.index({ team: 1, auction: 1 });
bidSchema.index({ createdAt: -1 });

const Bid = mongoose.model('Bid', bidSchema);
module.exports = Bid;
