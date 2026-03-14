const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String },
  
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],

  status: { type: String, enum: ['waiting', 'active', 'paused', 'completed'], default: 'waiting' },

  currentAuction: {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
    currentBid: { type: Number, default: 0 },
    currentBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    currentBidderName: { type: String, default: '' },
    startTime: { type: Date },
    timerDuration: { type: Number, default: 30 }, // seconds
    isActive: { type: Boolean, default: false },
  },

  settings: {
    timerDuration: { type: Number, default: 30 },
    bidIncrement: { type: Number, default: 5 }, // Lakhs
    autoNextPlayer: { type: Boolean, default: false },
    allowUnsold: { type: Boolean, default: true },
    maxOverseaPlayers: { type: Number, default: 8 },
  },

  auctionLog: [{
    action: String,
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    playerName: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    teamName: String,
    amount: Number,
    timestamp: { type: Date, default: Date.now },
  }],

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
