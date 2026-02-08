import { Router, Response } from 'express';
import { prisma } from '../services/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { AppError } from '../middleware/errorHandler.js';
import { Sport } from '@prisma/client';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  const [totalUsers, totalGames, totalVenues, activeGames, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.venue.count(),
    prisma.game.count({ where: { status: 'upcoming' } }),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    }),
  ]);

  const gamesBySport = await prisma.game.groupBy({
    by: ['sport'],
    _count: { id: true },
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      totalGames,
      totalVenues,
      activeGames,
      recentUsers,
      gamesBySport: gamesBySport.map(g => ({ sport: g.sport, count: g._count.id })),
    },
  });
});

// GET /api/admin/users - List users with search and pagination
router.get('/users', async (req: AuthRequest, res: Response) => {
  const { search, page = '1', limit = '20', role, isBanned } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (isBanned !== undefined) {
    where.isBanned = isBanned === 'true';
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            hostedGames: true,
            rsvps: true,
          },
        },
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      phone: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      preferredSports: true,
      skillLevels: true,
      isBanned: true,
      bannedAt: true,
      bannedReason: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      hostedGames: {
        select: {
          id: true,
          title: true,
          sport: true,
          dateTime: true,
          status: true,
        },
        orderBy: { dateTime: 'desc' },
        take: 10,
      },
      rsvps: {
        select: {
          id: true,
          status: true,
          game: {
            select: {
              id: true,
              title: true,
              sport: true,
              dateTime: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ success: true, data: user });
});

// PATCH /api/admin/users/:id - Update user
router.patch('/users/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, phone, role } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(role && { role }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isBanned: true,
    },
  });

  res.json({ success: true, data: user });
});

// POST /api/admin/users/:id/ban - Ban user
router.post('/users/:id/ban', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  // Prevent self-ban
  if (id === req.userId) {
    throw new AppError('Cannot ban yourself', 400);
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      isBanned: true,
      bannedAt: new Date(),
      bannedReason: reason || null,
    },
    select: {
      id: true,
      phone: true,
      name: true,
      isBanned: true,
      bannedAt: true,
      bannedReason: true,
    },
  });

  res.json({ success: true, data: user, message: 'User banned successfully' });
});

// POST /api/admin/users/:id/unban - Unban user
router.post('/users/:id/unban', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: {
      isBanned: false,
      bannedAt: null,
      bannedReason: null,
    },
    select: {
      id: true,
      phone: true,
      name: true,
      isBanned: true,
    },
  });

  res.json({ success: true, data: user, message: 'User unbanned successfully' });
});

// GET /api/admin/games - List all games
router.get('/games', async (req: AuthRequest, res: Response) => {
  const { search, sport, status, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { host: { name: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  if (sport) {
    where.sport = sport;
  }

  if (status) {
    where.status = status;
  }

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      select: {
        id: true,
        title: true,
        sport: true,
        dateTime: true,
        status: true,
        maxPlayers: true,
        host: {
          select: { id: true, name: true },
        },
        venue: {
          select: { id: true, name: true },
        },
        _count: {
          select: { rsvps: { where: { status: 'confirmed' } } },
        },
      },
      skip,
      take: limitNum,
      orderBy: { dateTime: 'desc' },
    }),
    prisma.game.count({ where }),
  ]);

  res.json({
    success: true,
    data: games.map(g => ({
      ...g,
      currentPlayers: g._count.rsvps,
    })),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// DELETE /api/admin/games/:id - Delete game
router.delete('/games/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.game.delete({ where: { id } });

  res.json({ success: true, message: 'Game deleted successfully' });
});

// GET /api/admin/venues - List all venues
router.get('/venues', async (req: AuthRequest, res: Response) => {
  const { search, isPartner, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { address: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (isPartner !== undefined) {
    where.isPartner = isPartner === 'true';
  }

  const [venues, total] = await Promise.all([
    prisma.venue.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        sports: true,
        pricePerHour: true,
        isPartner: true,
        contactPhone: true,
        createdAt: true,
        _count: {
          select: { games: true },
        },
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.venue.count({ where }),
  ]);

  res.json({
    success: true,
    data: venues,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// POST /api/admin/venues - Create venue
router.post('/venues', async (req: AuthRequest, res: Response) => {
  const { name, address, latitude, longitude, sports, pricePerHour, images, amenities, isPartner, contactPhone } = req.body;

  if (!name || !address || latitude === undefined || longitude === undefined) {
    throw new AppError('Name, address, latitude and longitude are required', 400);
  }

  const venue = await prisma.venue.create({
    data: {
      name,
      address,
      latitude,
      longitude,
      sports: sports || [],
      pricePerHour: pricePerHour || null,
      images: images || [],
      amenities: amenities || [],
      isPartner: isPartner || false,
      contactPhone: contactPhone || null,
    },
  });

  res.status(201).json({ success: true, data: venue });
});

// GET /api/admin/venues/:id - Get venue details
router.get('/venues/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      games: {
        select: {
          id: true,
          title: true,
          sport: true,
          dateTime: true,
          status: true,
        },
        orderBy: { dateTime: 'desc' },
        take: 10,
      },
    },
  });

  if (!venue) {
    throw new AppError('Venue not found', 404);
  }

  res.json({ success: true, data: venue });
});

// PATCH /api/admin/venues/:id - Update venue
router.patch('/venues/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, address, latitude, longitude, sports, pricePerHour, images, amenities, isPartner, contactPhone } = req.body;

  const venue = await prisma.venue.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(address && { address }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(sports && { sports: sports as Sport[] }),
      ...(pricePerHour !== undefined && { pricePerHour: pricePerHour || null }),
      ...(images && { images }),
      ...(amenities && { amenities }),
      ...(isPartner !== undefined && { isPartner }),
      ...(contactPhone !== undefined && { contactPhone: contactPhone || null }),
    },
  });

  res.json({ success: true, data: venue });
});

// DELETE /api/admin/venues/:id - Delete venue
router.delete('/venues/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Check if venue has associated games
  const gamesCount = await prisma.game.count({ where: { venueId: id } });
  if (gamesCount > 0) {
    throw new AppError(`Cannot delete venue with ${gamesCount} associated games`, 400);
  }

  await prisma.venue.delete({ where: { id } });

  res.json({ success: true, message: 'Venue deleted successfully' });
});

export default router;
