const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  shortName: { type: String, required: true, maxlength: 4, uppercase: true },
  logo: { type: String, default: '' },
  primaryColor: { type: String, default: '#1a1a2e' },
  secondaryColor: { type: String, default: '#e94560' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  purse: { type: Number, required: true }, // Total budget in Lakhs
  purseRemaining: { type: Number },

  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  
  maxPlayers: { type: Number, default: 25 },
  minPlayers: { type: Number, default: 11 },

  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },

  stats: {
    batsmen: { type: Number, default: 0 },
    bowlers: { type: Number, default: 0 },
    allRounders: { type: Number, default: 0 },
    wicketKeepers: { type: Number, default: 0 },
    overseas: { type: Number, default: 0 },
  },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

teamSchema.pre('save', function(next) {
  if (this.isNew) this.purseRemaining = this.purse;
  next();
});

module.exports = mongoose.model('Team', teamSchema);
