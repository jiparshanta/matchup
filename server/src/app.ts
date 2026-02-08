import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import gamesRoutes from './routes/games.js';
import venuesRoutes from './routes/venues.js';
import usersRoutes from './routes/users.js';
import notificationsRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSocketHandlers } from './services/socket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://matchup.app']
      : ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://matchup.app']
    : ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:3001'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// Socket.io setup
setupSocketHandlers(io);

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 MatchUp server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, io };
