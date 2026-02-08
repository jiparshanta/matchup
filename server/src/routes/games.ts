import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../services/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { emitToGame } from '../services/socket.js';
import { sendPushNotification, createInAppNotification } from '../services/notifications.js';

const router = Router();

// Validation helper
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
    });
  }
  next();
};

// GET /api/games - List games with filters
router.get(
  '/',
  optionalAuth,
  [
    query('sport').optional().isIn(['football', 'cricket', 'basketball', 'volleyball', 'badminton']),
    query('skillLevel').optional().isIn(['beginner', 'intermediate', 'advanced', 'any']),
    query('latitude').optional().isFloat(),
    query('longitude').optional().isFloat(),
    query('radius').optional().isFloat({ min: 1, max: 100 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        sport,
        skillLevel,
        latitude,
        longitude,
        radius = 10,
        page = 1,
        limit = 20,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause
      const where: Record<string, unknown> = {
        status: 'upcoming',
        dateTime: { gte: new Date() },
      };

      if (sport) where.sport = sport;
      if (skillLevel) where.skillLevel = skillLevel;

      // Get games
      const [games, total] = await Promise.all([
        prisma.game.findMany({
          where,
          include: {
            host: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            venue: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
            _count: {
              select: {
                rsvps: {
                  where: { status: 'confirmed' },
                },
              },
            },
          },
          orderBy: { dateTime: 'asc' },
          skip,
          take: Number(limit),
        }),
        prisma.game.count({ where }),
      ]);

      // If location provided, sort by distance
      let sortedGames = games;
      if (latitude && longitude) {
        const lat = Number(latitude);
        const lng = Number(longitude);
        const rad = Number(radius);

        sortedGames = games
          .map((game) => ({
            ...game,
            distance: calculateDistance(lat, lng, game.latitude, game.longitude),
          }))
          .filter((game) => game.distance <= rad)
          .sort((a, b) => a.distance - b.distance);
      }

      // Format response
      const formattedGames = sortedGames.map((game) => ({
        id: game.id,
        title: game.title,
        sport: game.sport,
        host: game.host,
        venue: game.venue,
        customLocation: game.customLocation,
        latitude: game.latitude,
        longitude: game.longitude,
        dateTime: game.dateTime,
        duration: game.duration,
        maxPlayers: game.maxPlayers,
        currentPlayers: game._count.rsvps,
        skillLevel: game.skillLevel,
        price: game.price,
        distance: 'distance' in game ? game.distance : undefined,
      }));

      res.json({
        success: true,
        data: formattedGames,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/games/:id - Get game details
router.get(
  '/:id',
  optionalAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const game = await prisma.game.findUnique({
        where: { id },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              avatar: true,
              phone: true,
            },
          },
          venue: true,
          rsvps: {
            where: { status: { in: ['confirmed', 'waitlisted'] } },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!game) {
        throw new AppError('Game not found', 404);
      }

      // Check if current user has RSVP'd
      let userRsvp = null;
      if (req.userId) {
        userRsvp = game.rsvps.find((r) => r.userId === req.userId);
      }

      const confirmedRsvps = game.rsvps.filter((r) => r.status === 'confirmed');
      const waitlistedRsvps = game.rsvps.filter((r) => r.status === 'waitlisted');

      res.json({
        success: true,
        data: {
          ...game,
          currentPlayers: confirmedRsvps.length,
          waitlistCount: waitlistedRsvps.length,
          confirmedPlayers: confirmedRsvps.map((r) => r.user),
          waitlistedPlayers: waitlistedRsvps.map((r) => r.user),
          userRsvpStatus: userRsvp?.status || null,
          isHost: req.userId === game.hostId,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/games - Create a new game
router.post(
  '/',
  authenticate,
  [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
    body('sport').isIn(['football', 'cricket', 'basketball', 'volleyball', 'badminton']),
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('dateTime').isISO8601().withMessage('Invalid date format'),
    body('duration').isInt({ min: 30, max: 480 }).withMessage('Duration must be 30-480 minutes'),
    body('maxPlayers').isInt({ min: 2, max: 50 }).withMessage('Max players must be 2-50'),
    body('minPlayers').optional().isInt({ min: 2, max: 50 }),
    body('skillLevel').isIn(['beginner', 'intermediate', 'advanced', 'any']),
    body('venueId').optional().isString(),
    body('customLocation').optional().trim().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('price').optional().isInt({ min: 0, max: 10000 }),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        sport,
        venueId,
        customLocation,
        latitude,
        longitude,
        dateTime,
        duration,
        maxPlayers,
        minPlayers = 2,
        skillLevel,
        description,
        price,
      } = req.body;

      // Validate venue if provided
      if (venueId) {
        const venue = await prisma.venue.findUnique({ where: { id: venueId } });
        if (!venue) {
          throw new AppError('Venue not found', 404);
        }
      }

      // Create game
      const game = await prisma.game.create({
        data: {
          title,
          sport,
          hostId: req.userId!,
          venueId,
          customLocation,
          latitude,
          longitude,
          dateTime: new Date(dateTime),
          duration,
          maxPlayers,
          minPlayers,
          skillLevel,
          description,
          price,
        },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          venue: true,
        },
      });

      // Auto-RSVP the host
      await prisma.rSVP.create({
        data: {
          gameId: game.id,
          userId: req.userId!,
          status: 'confirmed',
        },
      });

      res.status(201).json({
        success: true,
        data: game,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/games/:id - Update a game
router.patch(
  '/:id',
  authenticate,
  [
    body('title').optional().trim().isLength({ min: 3, max: 100 }),
    body('dateTime').optional().isISO8601(),
    body('duration').optional().isInt({ min: 30, max: 480 }),
    body('maxPlayers').optional().isInt({ min: 2, max: 50 }),
    body('skillLevel').optional().isIn(['beginner', 'intermediate', 'advanced', 'any']),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['upcoming', 'in_progress', 'completed', 'cancelled']),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const game = await prisma.game.findUnique({ where: { id } });

      if (!game) {
        throw new AppError('Game not found', 404);
      }

      if (game.hostId !== req.userId) {
        throw new AppError('Only the host can update this game', 403);
      }

      const updatedGame = await prisma.game.update({
        where: { id },
        data: {
          ...req.body,
          dateTime: req.body.dateTime ? new Date(req.body.dateTime) : undefined,
        },
        include: {
          host: {
            select: { id: true, name: true, avatar: true },
          },
          venue: true,
        },
      });

      // Notify players if game was updated
      const io = req.app.get('io');
      emitToGame(io, id, 'game-updated', updatedGame);

      // Send push notifications for significant changes
      if (req.body.status === 'cancelled' || req.body.dateTime) {
        const rsvps = await prisma.rSVP.findMany({
          where: { gameId: id, status: 'confirmed' },
          select: { userId: true },
        });

        const notificationTitle = req.body.status === 'cancelled'
          ? 'Game Cancelled'
          : 'Game Updated';
        const notificationBody = req.body.status === 'cancelled'
          ? `${game.title} has been cancelled`
          : `${game.title} has been updated. Check the new details.`;

        for (const rsvp of rsvps) {
          if (rsvp.userId !== req.userId) {
            await sendPushNotification(rsvp.userId, {
              title: notificationTitle,
              body: notificationBody,
              data: { gameId: id },
            });
            await createInAppNotification(rsvp.userId, {
              title: notificationTitle,
              body: notificationBody,
              type: 'game_update',
              data: { gameId: id },
            });
          }
        }
      }

      res.json({
        success: true,
        data: updatedGame,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/games/:id/join - Join a game
router.post(
  '/:id/join',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const game = await prisma.game.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              rsvps: { where: { status: 'confirmed' } },
            },
          },
        },
      });

      if (!game) {
        throw new AppError('Game not found', 404);
      }

      if (game.status !== 'upcoming') {
        throw new AppError('Cannot join this game', 400);
      }

      // Check if already RSVP'd
      const existingRsvp = await prisma.rSVP.findUnique({
        where: {
          gameId_userId: {
            gameId: id,
            userId: req.userId!,
          },
        },
      });

      if (existingRsvp && existingRsvp.status !== 'cancelled') {
        throw new AppError('You have already joined this game', 400);
      }

      // Determine status (confirmed or waitlisted)
      const isFull = game._count.rsvps >= game.maxPlayers;
      const status = isFull ? 'waitlisted' : 'confirmed';

      const rsvp = await prisma.rSVP.upsert({
        where: {
          gameId_userId: {
            gameId: id,
            userId: req.userId!,
          },
        },
        update: { status },
        create: {
          gameId: id,
          userId: req.userId!,
          status,
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Emit real-time update
      const io = req.app.get('io');
      emitToGame(io, id, 'player-joined', {
        user: rsvp.user,
        status: rsvp.status,
      });

      // Notify host
      if (game.hostId !== req.userId) {
        await sendPushNotification(game.hostId, {
          title: 'New Player Joined',
          body: `${rsvp.user.name} ${status === 'waitlisted' ? 'is on the waitlist for' : 'joined'} ${game.title}`,
          data: { gameId: id },
        });
      }

      res.json({
        success: true,
        data: {
          status: rsvp.status,
          message: status === 'waitlisted'
            ? 'You have been added to the waitlist'
            : 'You have joined the game',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/games/:id/leave - Leave a game
router.post(
  '/:id/leave',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const game = await prisma.game.findUnique({ where: { id } });

      if (!game) {
        throw new AppError('Game not found', 404);
      }

      if (game.hostId === req.userId) {
        throw new AppError('Host cannot leave the game. Cancel it instead.', 400);
      }

      const rsvp = await prisma.rSVP.findUnique({
        where: {
          gameId_userId: {
            gameId: id,
            userId: req.userId!,
          },
        },
      });

      if (!rsvp || rsvp.status === 'cancelled') {
        throw new AppError('You are not in this game', 400);
      }

      // Update RSVP to cancelled
      await prisma.rSVP.update({
        where: { id: rsvp.id },
        data: { status: 'cancelled' },
      });

      // If player was confirmed, promote first waitlisted player
      if (rsvp.status === 'confirmed') {
        const nextInLine = await prisma.rSVP.findFirst({
          where: { gameId: id, status: 'waitlisted' },
          orderBy: { createdAt: 'asc' },
          include: { user: true },
        });

        if (nextInLine) {
          await prisma.rSVP.update({
            where: { id: nextInLine.id },
            data: { status: 'confirmed' },
          });

          // Notify the promoted player
          await sendPushNotification(nextInLine.userId, {
            title: 'Spot Available!',
            body: `You've been moved from the waitlist to confirmed for ${game.title}`,
            data: { gameId: id },
          });
        }
      }

      // Emit real-time update
      const io = req.app.get('io');
      emitToGame(io, id, 'player-left', { userId: req.userId });

      res.json({
        success: true,
        message: 'You have left the game',
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/games/my/hosted - Get games hosted by user
router.get(
  '/my/hosted',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const games = await prisma.game.findMany({
        where: { hostId: req.userId },
        include: {
          venue: { select: { id: true, name: true, address: true } },
          _count: { select: { rsvps: { where: { status: 'confirmed' } } } },
        },
        orderBy: { dateTime: 'desc' },
      });

      res.json({
        success: true,
        data: games.map((game) => ({
          ...game,
          currentPlayers: game._count.rsvps,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/games/my/joined - Get games user has joined
router.get(
  '/my/joined',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rsvps = await prisma.rSVP.findMany({
        where: {
          userId: req.userId,
          status: { in: ['confirmed', 'waitlisted'] },
        },
        include: {
          game: {
            include: {
              host: { select: { id: true, name: true, avatar: true } },
              venue: { select: { id: true, name: true, address: true } },
              _count: { select: { rsvps: { where: { status: 'confirmed' } } } },
            },
          },
        },
        orderBy: { game: { dateTime: 'asc' } },
      });

      res.json({
        success: true,
        data: rsvps.map((rsvp) => ({
          ...rsvp.game,
          currentPlayers: rsvp.game._count.rsvps,
          myStatus: rsvp.status,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Helper function to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export default router;
