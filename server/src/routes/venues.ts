import { Router, Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { prisma } from '../services/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

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

// GET /api/venues - List venues
router.get(
  '/',
  [
    query('sport').optional().isIn(['football', 'cricket', 'basketball', 'volleyball', 'badminton']),
    query('latitude').optional().isFloat(),
    query('longitude').optional().isFloat(),
    query('radius').optional().isFloat({ min: 1, max: 50 }),
    query('partnersOnly').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        sport,
        latitude,
        longitude,
        radius = 10,
        partnersOnly,
        page = 1,
        limit = 20,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause
      const where: Record<string, unknown> = {};

      if (sport) {
        where.sports = { has: sport as string };
      }

      if (partnersOnly === 'true') {
        where.isPartner = true;
      }

      const [venues, total] = await Promise.all([
        prisma.venue.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: Number(limit),
        }),
        prisma.venue.count({ where }),
      ]);

      // If location provided, sort by distance
      let sortedVenues = venues;
      if (latitude && longitude) {
        const lat = Number(latitude);
        const lng = Number(longitude);
        const rad = Number(radius);

        sortedVenues = venues
          .map((venue) => ({
            ...venue,
            distance: calculateDistance(lat, lng, venue.latitude, venue.longitude),
          }))
          .filter((venue) => venue.distance <= rad)
          .sort((a, b) => a.distance - b.distance);
      }

      res.json({
        success: true,
        data: sortedVenues,
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

// GET /api/venues/:id - Get venue details
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const venue = await prisma.venue.findUnique({
        where: { id },
        include: {
          games: {
            where: {
              status: 'upcoming',
              dateTime: { gte: new Date() },
            },
            include: {
              host: {
                select: { id: true, name: true, avatar: true },
              },
              _count: {
                select: { rsvps: { where: { status: 'confirmed' } } },
              },
            },
            orderBy: { dateTime: 'asc' },
            take: 10,
          },
        },
      });

      if (!venue) {
        throw new AppError('Venue not found', 404);
      }

      res.json({
        success: true,
        data: {
          ...venue,
          upcomingGames: venue.games.map((game) => ({
            ...game,
            currentPlayers: game._count.rsvps,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/venues/search - Search venues by name
router.get(
  '/search',
  [query('q').notEmpty().withMessage('Search query is required')],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, limit = 10 } = req.query;

      const venues = await prisma.venue.findMany({
        where: {
          name: {
            contains: q as string,
            mode: 'insensitive',
          },
        },
        take: Number(limit),
        orderBy: { isPartner: 'desc' },
      });

      res.json({
        success: true,
        data: venues,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Helper function to calculate distance
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
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
