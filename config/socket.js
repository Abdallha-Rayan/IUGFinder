const socketIO = require('socket.io');

const socketHandler = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*',
    },
  });

  const userSockets = {};

  io.on('connection', (socket) => {
    console.log('🟢 Socket connected:', socket.id);

    socket.on('register', (userId) => {
      userSockets[userId] = socket.id;
      console.log(`✅ User ${userId} registered with socket ID ${socket.id}`);
    });

    socket.on('disconnect', () => {
      for (let userId in userSockets) {
        if (userSockets[userId] === socket.id) {
          delete userSockets[userId];
          console.log(`❌ User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

module.exports = socketHandler;
