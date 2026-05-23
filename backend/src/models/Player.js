const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Player name required'],
    trim: true
  },
  country: { type: String, required: true },
  isOverseas: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ['BAT', 'BOWL', 'ALL', 'WK-BAT'],
    required: true
  },
  battingStyle: {
    type: String,
    enum: ['Right-hand', 'Left-hand', null],
    default: null
  },
  bowlingStyle: {
    type: String,
    default: null
  },
  image: { type: String, default: null },
  emoji: { type: String, default: '🏏' },

  // Base auction info
  basePrice: {
    type: Number,
    required: true,
    min: 0.2,
    max: 15
  },

  // IPL career stats
  iplStats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    fifties: { type: Number, default: 0 },
    hundreds: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
    bowlingAvg: { type: Number, default: 0 },
    bestBowling: { type: String, default: '0/0' }
  },

  // Auction status
  auctionStatus: {
    type: String,
    enum: ['available', 'sold', 'unsold', 'withdrawn'],
    default: 'available'
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  soldPrice: {
    type: Number,
    default: null
  },

  // AI metadata
  aiPredictedValue: { type: Number, default: null },
  popularityScore: { type: Number, default: 50, min: 0, max: 100 },
  demandLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'extreme'],
    default: 'medium'
  },
  injuryStatus: {
    type: String,
    enum: ['fit', 'doubtful', 'injured'],
    default: 'fit'
  },
  tags: [{ type: String }],
  order: { type: Number, default: 999 }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

playerSchema.index({ name: 'text', country: 'text' });
playerSchema.index({ auctionStatus: 1, role: 1 });
playerSchema.index({ order: 1 });

const Player = mongoose.model('Player', playerSchema);
module.exports = Player;
