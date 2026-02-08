import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for socket connections
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback-secret'
      ) as { userId: string };

      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join a game room for real-time updates
    socket.on('join-game', (gameId: string) => {
      socket.join(`game:${gameId}`);
      console.log(`User ${socket.userId} joined game room: ${gameId}`);
    });

    // Leave a game room
    socket.on('leave-game', (gameId: string) => {
      socket.leave(`game:${gameId}`);
      console.log(`User ${socket.userId} left game room: ${gameId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// Helper function to emit events to specific rooms
export const emitToGame = (io: Server, gameId: string, event: string, data: unknown) => {
  io.to(`game:${gameId}`).emit(event, data);
};

export const emitToUser = (io: Server, userId: string, event: string, data: unknown) => {
  io.to(`user:${userId}`).emit(event, data);
};
