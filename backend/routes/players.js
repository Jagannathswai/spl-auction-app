// const express = require('express');
// const router = express.Router();
// const path = require('path');
// const fs = require('fs');
// const Player = require('../models/Player');
// const { protect, adminOnly } = require('../middleware/auth');

// // GET /api/players
// router.get('/', async (req, res) => {
//   try {
//     const { status, role, room, search } = req.query;
//     let query = {};
//     if (status) query.status = status;
//     if (role) query.role = role;
//     if (room) query.room = room;
//     if (search) query.name = { $regex: search, $options: 'i' };

//     const players = await Player.find(query)
//       .populate('soldTo', 'name shortName primaryColor')
//       .sort({ auctionOrder: 1, createdAt: 1 });
//     res.json({ success: true, players, count: players.length });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // GET /api/players/stats/summary
// router.get('/stats/summary', protect, async (req, res) => {
//   try {
//     const total = await Player.countDocuments();
//     const sold = await Player.countDocuments({ status: 'sold' });
//     const unsold = await Player.countDocuments({ status: 'unsold' });
//     const available = await Player.countDocuments({ status: 'available' });
//     const inAuction = await Player.countDocuments({ status: 'in_auction' });

//     const soldPlayers = await Player.find({ status: 'sold' });
//     const totalSoldAmount = soldPlayers.reduce((acc, p) => acc + (p.soldPrice || 0), 0);
//     const highestSold = soldPlayers.reduce((max, p) => (p.soldPrice > (max?.soldPrice || 0) ? p : max), null);

//     res.json({ success: true, stats: { total, sold, unsold, available, inAuction, totalSoldAmount, highestSold } });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // GET /api/players/:id
// router.get('/:id', protect, async (req, res) => {
//   try {
//     const player = await Player.findById(req.params.id)
//       .populate('soldTo', 'name shortName primaryColor logo')
//       .populate('room', 'name code');
//     if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
//     res.json({ success: true, player });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Helper: resolve final photo value
// const resolvePhoto = async (req, existingPhoto) => {
//   // Priority 1: uploaded file
//   if (req.files && req.files.photo) {
//     const photo = req.files.photo;
//     const uploadDir = path.join(__dirname, '../uploads/players');
//     fs.mkdirSync(uploadDir, { recursive: true });
//     const fileName = 'player_' + Date.now() + path.extname(photo.name);
//     await photo.mv(path.join(uploadDir, fileName));
//     return '/uploads/players/' + fileName;
//   }
//   // Priority 2: URL pasted
//   if (req.body.photoUrl && req.body.photoUrl.trim()) {
//     return req.body.photoUrl.trim();
//   }
//   // Keep existing
//   return existingPhoto || '';
// };

// // POST /api/players (admin)
// router.post('/', protect, adminOnly, async (req, res) => {
//   try {
//     const photo = await resolvePhoto(req, '');
//     let playerData = { ...req.body, photo };
//     if (playerData.stats && typeof playerData.stats === 'string') {
//       playerData.stats = JSON.parse(playerData.stats);
//     }
//     const player = await Player.create(playerData);
//     res.status(201).json({ success: true, player });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // PUT /api/players/:id (admin)
// router.put('/:id', protect, adminOnly, async (req, res) => {
//   try {
//     const existing = await Player.findById(req.params.id);
//     if (!existing) return res.status(404).json({ success: false, message: 'Player not found' });

//     const photo = await resolvePhoto(req, existing.photo);
//     let updateData = { ...req.body, photo };
//     if (updateData.stats && typeof updateData.stats === 'string') {
//       updateData.stats = JSON.parse(updateData.stats);
//     }

//     const player = await Player.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
//     res.json({ success: true, player });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // DELETE /api/players/:id (admin)
// router.delete('/:id', protect, adminOnly, async (req, res) => {
//   try {
//     const player = await Player.findByIdAndDelete(req.params.id);
//     if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
//     res.json({ success: true, message: 'Player deleted' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // POST /api/players/bulk/import
// router.post('/bulk/import', protect, adminOnly, async (req, res) => {
//   try {
//     const { players } = req.body;
//     if (!players || !Array.isArray(players)) {
//       return res.status(400).json({ success: false, message: 'Players array required' });
//     }
//     const created = await Player.insertMany(players);
//     res.json({ success: true, message: created.length + ' players imported', players: created });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const { protect, adminOnly } = require('../middleware/auth');
const cloudinary = require('../utils/cloudinary');

// GET /api/players
router.get('/', async (req, res) => {
  try {
    const { status, role, room, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (role) query.role = role;
    if (room) query.room = room;
    if (search) query.name = { $regex: search, $options: 'i' };

    const players = await Player.find(query)
      .populate('soldTo', 'name shortName primaryColor')
      .sort({ auctionOrder: 1, createdAt: 1 });
    res.json({ success: true, players, count: players.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/players/stats/summary
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const total = await Player.countDocuments();
    const sold = await Player.countDocuments({ status: 'sold' });
    const unsold = await Player.countDocuments({ status: 'unsold' });
    const available = await Player.countDocuments({ status: 'available' });
    const inAuction = await Player.countDocuments({ status: 'in_auction' });

    const soldPlayers = await Player.find({ status: 'sold' });
    const totalSoldAmount = soldPlayers.reduce((acc, p) => acc + (p.soldPrice || 0), 0);
    const highestSold = soldPlayers.reduce((max, p) => (p.soldPrice > (max?.soldPrice || 0) ? p : max), null);

    res.json({ success: true, stats: { total, sold, unsold, available, inAuction, totalSoldAmount, highestSold } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/players/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('soldTo', 'name shortName primaryColor logo')
      .populate('room', 'name code');
    if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper: resolve final photo value using Cloudinary
const resolvePhoto = async (req, existingPhoto) => {
  // Priority 1: uploaded file → Cloudinary
  if (req.files && req.files.photo) {
    const photo = req.files.photo;
    const result = await cloudinary.uploader.upload(photo.tempFilePath || photo.data.toString('base64'), {
      folder: 'ipl-auction/players',
      resource_type: 'image',
    });
    return result.secure_url;
  }
  // Priority 2: URL pasted
  if (req.body.photoUrl && req.body.photoUrl.trim()) {
    return req.body.photoUrl.trim();
  }
  // Keep existing
  return existingPhoto || '';
};

// POST /api/players (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const photo = await resolvePhoto(req, '');
    let playerData = { ...req.body, photo };
    if (playerData.stats && typeof playerData.stats === 'string') {
      playerData.stats = JSON.parse(playerData.stats);
    }
    const player = await Player.create(playerData);
    res.status(201).json({ success: true, player });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/players/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const existing = await Player.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Player not found' });

    const photo = await resolvePhoto(req, existing.photo);
    let updateData = { ...req.body, photo };
    if (updateData.stats && typeof updateData.stats === 'string') {
      updateData.stats = JSON.parse(updateData.stats);
    }

    const player = await Player.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/players/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
    res.json({ success: true, message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/players/bulk/import
router.post('/bulk/import', protect, adminOnly, async (req, res) => {
  try {
    const { players } = req.body;
    if (!players || !Array.isArray(players)) {
      return res.status(400).json({ success: false, message: 'Players array required' });
    }
    const created = await Player.insertMany(players);
    res.json({ success: true, message: created.length + ' players imported', players: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;