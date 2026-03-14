const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Team = require('../models/Team');
const Room = require('../models/Room');
const { protect, adminOnly } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');

// PUT /api/auction/:roomId/start/:playerId - start auction for a player
router.put('/:roomId/start/:playerId', protect, adminOnly, async (req, res) => {
  try {
    const { roomId, playerId } = req.params;
    const room = await Room.findById(roomId);
    const player = await Player.findById(playerId);

    if (!room || !player) return res.status(404).json({ success: false, message: 'Room or player not found' });

    // Update player status
    await Player.findByIdAndUpdate(playerId, { status: 'in_auction' });

    // Update room current auction
    room.currentAuction = {
      player: playerId,
      currentBid: player.basePrice,
      currentBidder: null,
      currentBidderName: '',
      startTime: new Date(),
      timerDuration: room.settings.timerDuration,
      isActive: true,
    };
    await room.save();

    // Emit to socket
    req.io.to(roomId).emit('auction:started', {
      player,
      currentBid: player.basePrice,
      currentBidder: null,
      timerDuration: room.settings.timerDuration,
    });

    res.json({ success: true, message: 'Auction started', room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auction/:roomId/bid - place a bid
router.put('/:roomId/bid', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { teamId, amount } = req.body;

    const room = await Room.findById(roomId);
    if (!room || !room.currentAuction.isActive) {
      return res.status(400).json({ success: false, message: 'No active auction' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    if (amount <= room.currentAuction.currentBid) {
      return res.status(400).json({ success: false, message: 'Bid must be higher than current bid' });
    }

    if (amount > team.purseRemaining) {
      return res.status(400).json({ success: false, message: 'Insufficient purse' });
    }

    // Update room bid
    room.currentAuction.currentBid = amount;
    room.currentAuction.currentBidder = teamId;
    room.currentAuction.currentBidderName = team.name;
    await room.save();

    // Add to player bid history
    await Player.findByIdAndUpdate(room.currentAuction.player, {
      $push: { bidHistory: { team: teamId, teamName: team.name, amount } }
    });

    // Emit bid update
    req.io.to(roomId).emit('auction:bid', {
      playerId: room.currentAuction.player,
      teamId,
      teamName: team.name,
      amount,
      timestamp: new Date(),
    });

    res.json({ success: true, message: 'Bid placed', currentBid: amount, bidder: team.name });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auction/:roomId/sold - mark player as sold
router.put('/:roomId/sold', protect, adminOnly, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room || !room.currentAuction.isActive) {
      return res.status(400).json({ success: false, message: 'No active auction' });
    }

    if (!room.currentAuction.currentBidder) {
      return res.status(400).json({ success: false, message: 'No bids placed' });
    }

    const playerId = room.currentAuction.player;
    const teamId = room.currentAuction.currentBidder;
    const soldPrice = room.currentAuction.currentBid;

    // Update player
    const player = await Player.findByIdAndUpdate(playerId, {
      status: 'sold',
      soldPrice,
      soldTo: teamId,
    }, { new: true });

    // Update team
    const team = await Team.findById(teamId);
    team.players.push(playerId);
    team.purseRemaining -= soldPrice;

    // Update team stats
    const roleMap = { 'Batsman': 'batsmen', 'Bowler': 'bowlers', 'All-Rounder': 'allRounders', 'Wicket-Keeper': 'wicketKeepers' };
    if (roleMap[player.role]) team.stats[roleMap[player.role]] += 1;
    if (player.nationality !== 'Indian') team.stats.overseas += 1;
    await team.save();

    // Add to auction log
    room.auctionLog.push({
      action: 'sold',
      player: playerId,
      playerName: player.name,
      team: teamId,
      teamName: team.name,
      amount: soldPrice,
    });

    room.currentAuction = { player: null, currentBid: 0, currentBidder: null, currentBidderName: '', isActive: false };
    await room.save();

    // Emit sold event
    req.io.to(roomId).emit('auction:sold', { player, team, soldPrice });

    // Send notification
    await sendNotification({
      type: 'sold',
      playerName: player.name,
      teamName: team.name,
      amount: soldPrice,
      teamOwnerEmail: null,
    });

    res.json({ success: true, message: `${player.name} sold to ${team.name} for ₹${soldPrice}L`, player, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auction/:roomId/unsold - mark player as unsold
router.put('/:roomId/unsold', protect, adminOnly, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room || !room.currentAuction.isActive) {
      return res.status(400).json({ success: false, message: 'No active auction' });
    }

    const playerId = room.currentAuction.player;
    const player = await Player.findByIdAndUpdate(playerId, { status: 'unsold' }, { new: true });

    room.auctionLog.push({ action: 'unsold', player: playerId, playerName: player.name });
    room.currentAuction = { player: null, currentBid: 0, currentBidder: null, currentBidderName: '', isActive: false };
    await room.save();

    req.io.to(roomId).emit('auction:unsold', { player });

    res.json({ success: true, message: `${player.name} went unsold`, player });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auction/:roomId/log
router.get('/:roomId/log', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('auctionLog.player', 'name photo role')
      .populate('auctionLog.team', 'name shortName primaryColor');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, log: room.auctionLog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auction/:roomId/status - update room status
router.put('/:roomId/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const room = await Room.findByIdAndUpdate(req.params.roomId, { status }, { new: true });
    req.io.to(req.params.roomId).emit('room:status', { status });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
