const express = require('express');
const router = express.Router();
const path = require('path');
const Team = require('../models/Team');
const Player = require('../models/Player');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/teams
router.get('/', async (req, res) => {
  try {
    const { room } = req.query;
    let query = {};
    if (room) query.room = room;

    const teams = await Team.find(query)
      .populate('owner', 'name email')
      .populate('players', 'name role photo soldPrice')
      .sort({ createdAt: 1 });
    res.json({ success: true, teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/teams/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('players');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/teams/my/team
router.get('/my/team', protect, async (req, res) => {
  try {
    const team = await Team.findOne({ owner: req.user._id })
      .populate('players');
    if (!team) return res.status(404).json({ success: false, message: 'No team assigned' });
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/teams (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    let logoPath = '';
    if (req.files && req.files.logo) {
      const logo = req.files.logo;
      const fileName = `team_${Date.now()}${path.extname(logo.name)}`;
      const fs = require('fs');
      fs.mkdirSync(path.join(__dirname, '../uploads/teams'), { recursive: true });
      await logo.mv(path.join(__dirname, '../uploads/teams', fileName));
      logoPath = `/uploads/teams/${fileName}`;
    }

    const team = await Team.create({ ...req.body, logo: logoPath });
    res.status(201).json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/teams/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.files && req.files.logo) {
      const logo = req.files.logo;
      const fileName = `team_${Date.now()}${path.extname(logo.name)}`;
      const fs = require('fs');
      fs.mkdirSync(path.join(__dirname, '../uploads/teams'), { recursive: true });
      await logo.mv(path.join(__dirname, '../uploads/teams', fileName));
      updateData.logo = `/uploads/teams/${fileName}`;
    }
    const team = await Team.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/teams/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/teams/:id/assign-owner
router.put('/:id/assign-owner', protect, adminOnly, async (req, res) => {
  try {
    const { ownerId } = req.body;
    const team = await Team.findByIdAndUpdate(req.params.id, { owner: ownerId }, { new: true })
      .populate('owner', 'name email');
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
