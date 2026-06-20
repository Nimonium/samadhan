import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // CM dashboard can join a room
  socket.on('join_cm_room', () => {
    socket.join('cm_room');
    console.log(`Socket ${socket.id} joined cm_room`);
  });

  // API route can send to this server
  socket.on('internal_critical_alert', (data) => {
    console.log(`[Socket Server] Emitting critical alert to CM room:`, data.complaintId);
    io.to('cm_room').emit('critical_alert', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server listening on port ${PORT}`);
});
