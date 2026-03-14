const Room = require('../models/Room');

module.exports = (io) => {
  // Track active timers per room
  const auctionTimers = {};

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a room
    socket.on('room:join', async ({ roomId, userId, role }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userId = userId;
      socket.role = role;

      try {
        const room = await Room.findById(roomId)
          .populate('currentAuction.player')
          .populate('currentAuction.currentBidder', 'name shortName');

        // Send current auction state to new joiner
        if (room && room.currentAuction.isActive) {
          socket.emit('auction:state', {
            player: room.currentAuction.player,
            currentBid: room.currentAuction.currentBid,
            currentBidder: room.currentAuction.currentBidder,
            currentBidderName: room.currentAuction.currentBidderName,
            timerDuration: room.settings.timerDuration,
          });
        }

        // Notify others
        socket.to(roomId).emit('room:user_joined', { userId, role, socketId: socket.id });
        console.log(`👤 User ${userId} joined room ${roomId}`);
      } catch (err) {
        console.error('room:join error:', err);
      }
    });

    // Leave room
    socket.on('room:leave', ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('room:user_left', { socketId: socket.id });
    });

    // Admin starts timer countdown
    socket.on('auction:start_timer', ({ roomId, duration }) => {
      if (auctionTimers[roomId]) clearInterval(auctionTimers[roomId]);

      let timeLeft = duration || 30;
      io.to(roomId).emit('timer:update', { timeLeft });

      auctionTimers[roomId] = setInterval(() => {
        timeLeft--;
        io.to(roomId).emit('timer:update', { timeLeft });

        if (timeLeft <= 0) {
          clearInterval(auctionTimers[roomId]);
          delete auctionTimers[roomId];
          io.to(roomId).emit('timer:expired');
        }
      }, 1000);
    });

    // Reset timer on new bid
    socket.on('auction:reset_timer', ({ roomId, duration }) => {
      if (auctionTimers[roomId]) clearInterval(auctionTimers[roomId]);

      let timeLeft = duration || 30;
      io.to(roomId).emit('timer:update', { timeLeft });

      auctionTimers[roomId] = setInterval(() => {
        timeLeft--;
        io.to(roomId).emit('timer:update', { timeLeft });

        if (timeLeft <= 0) {
          clearInterval(auctionTimers[roomId]);
          delete auctionTimers[roomId];
          io.to(roomId).emit('timer:expired');
        }
      }, 1000);
    });

    // Stop timer manually
    socket.on('auction:stop_timer', ({ roomId }) => {
      if (auctionTimers[roomId]) {
        clearInterval(auctionTimers[roomId]);
        delete auctionTimers[roomId];
      }
      io.to(roomId).emit('timer:stopped');
    });

    // Chat message
    socket.on('chat:message', ({ roomId, message, userName, role }) => {
      io.to(roomId).emit('chat:message', {
        message,
        userName,
        role,
        timestamp: new Date(),
        socketId: socket.id,
      });
    });

    // Admin announcements
    socket.on('admin:announce', ({ roomId, message }) => {
      io.to(roomId).emit('admin:announce', { message, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('room:user_left', { socketId: socket.id });
      }
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};
