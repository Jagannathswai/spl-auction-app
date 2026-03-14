// const express = require('express');
// const router = express.Router();
// const Room = require('../models/Room');
// const { protect, adminOnly } = require('../middleware/auth');

// const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// // GET /api/rooms
// router.get('/', protect, async (req, res) => {
//   try {
//     const query = req.user.role === 'admin' ? {} : {};
//     const rooms = await Room.find(query)
//       .populate('admin', 'name email')
//       .populate('teams', 'name shortName primaryColor logo purseRemaining')
//       .sort({ createdAt: -1 });
//     res.json({ success: true, rooms });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // GET /api/rooms/:id
// router.get('/:id', async (req, res) => {
//   try {
//     const room = await Room.findById(req.params.id)
//       .populate('admin', 'name email')
//       .populate('teams')
//       .populate('players')
//       .populate('currentAuction.player')
//       .populate('currentAuction.currentBidder', 'name shortName');
//     if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
//     res.json({ success: true, room });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // GET /api/rooms/join/:code
// router.get('/join/:code', protect, async (req, res) => {
//   try {
//     const room = await Room.findOne({ code: req.params.code.toUpperCase(), isActive: true })
//       .populate('admin', 'name')
//       .populate('teams', 'name shortName primaryColor');
//     if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
//     res.json({ success: true, room });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // POST /api/rooms (admin)
// router.post('/', protect, adminOnly, async (req, res) => {
//   try {
//     let code = generateCode();
//     while (await Room.findOne({ code })) { code = generateCode(); }

//     const room = await Room.create({ ...req.body, admin: req.user._id, code });
//     res.status(201).json({ success: true, room });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // PUT /api/rooms/:id (admin)
// router.put('/:id', protect, adminOnly, async (req, res) => {
//   try {
//     const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
//     res.json({ success: true, room });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // DELETE /api/rooms/:id
// router.delete('/:id', protect, adminOnly, async (req, res) => {
//   try {
//     await Room.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: 'Room deleted' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // PUT /api/rooms/:id/add-team
// router.put('/:id/add-team', protect, adminOnly, async (req, res) => {
//   try {
//     const { teamId } = req.body;
//     const room = await Room.findByIdAndUpdate(req.params.id, { $addToSet: { teams: teamId } }, { new: true });
//     res.json({ success: true, room });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // PUT /api/rooms/:id/add-player
// router.put('/:id/add-player', protect, adminOnly, async (req, res) => {
//   try {
//     const { playerId } = req.body;
//     const room = await Room.findByIdAndUpdate(req.params.id, { $addToSet: { players: playerId } }, { new: true });
//     res.json({ success: true, room });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { protect, adminOnly } = require('../middleware/auth');

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// GET /api/rooms
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : {};
    const rooms = await Room.find(query)
      .populate('admin', 'name email')
      .populate('teams', 'name shortName primaryColor logo purseRemaining')
      .sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/rooms/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('teams')
      .populate('players')
      .populate('currentAuction.player')
      .populate('currentAuction.currentBidder', 'name shortName');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/rooms/join/:code
router.get('/join/:code', protect, async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase(), isActive: true })
      .populate('admin', 'name')
      .populate('teams', 'name shortName primaryColor');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/rooms (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    let code = generateCode();
    while (await Room.findOne({ code })) { code = generateCode(); }

    const room = await Room.create({ ...req.body, admin: req.user._id, code });
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/rooms/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/rooms/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/rooms/:id/add-team
router.put('/:id/add-team', protect, adminOnly, async (req, res) => {
  try {
    const { teamId } = req.body;
    const Team = require('../models/Team');
    const room = await Room.findByIdAndUpdate(req.params.id, { $addToSet: { teams: teamId } }, { new: true });
    // Also update team's room field
    await Team.findByIdAndUpdate(teamId, { room: req.params.id });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/rooms/:id/add-player
router.put('/:id/add-player', protect, adminOnly, async (req, res) => {
  try {
    const { playerId } = req.body;
    const Player = require('../models/Player');
    // Add player to room's players array
    const room = await Room.findByIdAndUpdate(req.params.id, { $addToSet: { players: playerId } }, { new: true });
    // Also update player's room field so AuctionRoom can fetch by room
    await Player.findByIdAndUpdate(playerId, { room: req.params.id });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;