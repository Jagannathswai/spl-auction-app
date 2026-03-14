const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Room = require('../models/Room');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/export/auction/:roomId/excel
router.get('/auction/:roomId/excel', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    const teams = await Team.find({ room: req.params.roomId }).populate('players');
    const players = await Player.find({ room: req.params.roomId }).populate('soldTo', 'name');

    const wb = XLSX.utils.book_new();

    // Sheet 1: All Players
    const playerData = players.map(p => ({
      'Player Name': p.name,
      'Role': p.role,
      'Nationality': p.nationality,
      'Grade': p.grade,
      'Base Price (L)': p.basePrice,
      'Status': p.status,
      'Sold Price (L)': p.soldPrice || '-',
      'Sold To': p.soldTo?.name || '-',
    }));
    const ws1 = XLSX.utils.json_to_sheet(playerData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Players');

    // Sheet 2: Teams Summary
    const teamData = teams.map(t => ({
      'Team': t.name,
      'Short Name': t.shortName,
      'Total Purse (L)': t.purse,
      'Amount Spent (L)': t.purse - t.purseRemaining,
      'Remaining Purse (L)': t.purseRemaining,
      'Total Players': t.players.length,
      'Batsmen': t.stats.batsmen,
      'Bowlers': t.stats.bowlers,
      'All-Rounders': t.stats.allRounders,
      'Wicket-Keepers': t.stats.wicketKeepers,
      'Overseas': t.stats.overseas,
    }));
    const ws2 = XLSX.utils.json_to_sheet(teamData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Teams');

    // Sheet 3: Auction Log
    if (room && room.auctionLog) {
      const logData = room.auctionLog.map(l => ({
        'Action': l.action.toUpperCase(),
        'Player': l.playerName,
        'Team': l.teamName || '-',
        'Amount (L)': l.amount || '-',
        'Time': new Date(l.timestamp).toLocaleString(),
      }));
      const ws3 = XLSX.utils.json_to_sheet(logData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Auction Log');
    }

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Disposition', `attachment; filename="auction_report_${Date.now()}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/export/players/excel
router.get('/players/excel', protect, adminOnly, async (req, res) => {
  try {
    const players = await Player.find().populate('soldTo', 'name');
    const wb = XLSX.utils.book_new();

    const data = players.map(p => ({
      'Name': p.name,
      'Role': p.role,
      'Nationality': p.nationality,
      'Age': p.age || '-',
      'Grade': p.grade,
      'Base Price (L)': p.basePrice,
      'Status': p.status,
      'Sold Price (L)': p.soldPrice || '-',
      'Sold To': p.soldTo?.name || '-',
      'Matches': p.stats.matches,
      'Runs': p.stats.runs,
      'Wickets': p.stats.wickets,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Players');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Disposition', `attachment; filename="players_${Date.now()}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
