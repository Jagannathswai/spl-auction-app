// const mongoose = require('mongoose');

// const playerSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   photo: { type: String, default: '' },
//   role: { type: String, enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'], required: true },
//   nationality: { type: String, default: 'Indian' },
//   age: { type: Number },
//   battingStyle: { type: String, enum: ['Right-Hand', 'Left-Hand', ''] },
//   bowlingStyle: { type: String },
  
//   // Stats
//   stats: {
//     matches: { type: Number, default: 0 },
//     runs: { type: Number, default: 0 },
//     wickets: { type: Number, default: 0 },
//     average: { type: Number, default: 0 },
//     strikeRate: { type: Number, default: 0 },
//     economy: { type: Number, default: 0 },
//     centuries: { type: Number, default: 0 },
//     halfCenturies: { type: Number, default: 0 },
//     highestScore: { type: Number, default: 0 },
//     bestBowling: { type: String, default: '0/0' },
//   },

//   basePrice: { type: Number, required: true }, // in Lakhs
//   soldPrice: { type: Number, default: null },
  
//   status: { type: String, enum: ['available', 'sold', 'unsold', 'in_auction'], default: 'available' },
//   soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  
//   room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
//   auctionOrder: { type: Number, default: 0 },

//   // Bid history
//   bidHistory: [{
//     team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
//     teamName: String,
//     amount: Number,
//     timestamp: { type: Date, default: Date.now }
//   }],

//   grade: { type: String, enum: ['A+', 'A', 'B', 'C'], default: 'B' },
//   isCapped: { type: Boolean, default: false },
// }, { timestamps: true });

// module.exports = mongoose.model('Player', playerSchema);
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  photo: { type: String, default: '' },   // uploaded file path OR external URL
  photoUrl: { type: String, default: '' }, // user-pasted URL
  role: { type: String, enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'], required: true },
  nationality: { type: String, default: 'Indian' },
  age: { type: Number },
  battingStyle: { type: String, enum: ['Right-Hand', 'Left-Hand', ''] },
  bowlingStyle: { type: String },
  
  // Stats
  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
    centuries: { type: Number, default: 0 },
    halfCenturies: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    bestBowling: { type: String, default: '0/0' },
  },

  basePrice: { type: Number, required: true }, // in Lakhs
  soldPrice: { type: Number, default: null },
  
  status: { type: String, enum: ['available', 'sold', 'unsold', 'in_auction'], default: 'available' },
  soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  auctionOrder: { type: Number, default: 0 },

  // Bid history
  bidHistory: [{
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    teamName: String,
    amount: Number,
    timestamp: { type: Date, default: Date.now }
  }],

  grade: { type: String, enum: ['A+', 'A', 'B', 'C'], default: 'B' },
  isCapped: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
