const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shortName: {
    type: String,
    required: true,
    uppercase: true,
    maxlength: 4
  },
  city: { type: String, required: true },
  primaryColor: { type: String, default: '#1565C0' },
  secondaryColor: { type: String, default: '#FFFFFF' },
  logo: { type: String, default: null },
  emoji: { type: String, default: '🏏' },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  purseRemaining: {
    type: Number,
    default: 100,       // crores
    min: 0
  },
  purseTotal: {
    type: Number,
    default: 100
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  overseasCount: {
    type: Number,
    default: 0,
    max: 8
  },
  maxPlayers: {
    type: Number,
    default: 25
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stats: {
    battersCount: { type: Number, default: 0 },
    bowlersCount: { type: Number, default: 0 },
    allRoundersCount: { type: Number, default: 0 },
    wicketKeepersCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

teamSchema.virtual('playerCount').get(function () {
  return Array.isArray(this.players) ? this.players.length : 0;
});

teamSchema.virtual('spentAmount').get(function () {
  return this.purseTotal - this.purseRemaining;
});

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
