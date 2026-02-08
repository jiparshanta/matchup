import { Response, NextFunction } from 'express';
import { prisma } from '../services/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const getUpcomingGamesForUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    const rsvps = await prisma.rSVP.findMany({
      where: {
        userId,
        status: 'confirmed',
        game: {
          status: 'upcoming',
          dateTime: { gte: new Date() },
        },
      },
      include: {
        game: {
          include: {
            venue: { select: { name: true } },
          },
        },
      },
      orderBy: { game: { dateTime: 'asc' } },
      take: 5,
    });

    res.json({
      success: true,
      data: rsvps.map((r) => r.game),
    });
  } catch (error) {
    next(error);
  }
};

export const getGameStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    const [gamesHosted, gamesJoined, upcomingGames] = await Promise.all([
      prisma.game.count({ where: { hostId: userId } }),
      prisma.rSVP.count({
        where: { userId, status: 'confirmed' },
      }),
      prisma.rSVP.count({
        where: {
          userId,
          status: 'confirmed',
          game: {
            status: 'upcoming',
            dateTime: { gte: new Date() },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        gamesHosted,
        gamesJoined,
        upcomingGames,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const searchGames = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string') {
      throw new AppError('Search query is required', 400);
    }

    const games = await prisma.game.findMany({
      where: {
        status: 'upcoming',
        dateTime: { gte: new Date() },
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { customLocation: { contains: q, mode: 'insensitive' } },
          { venue: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: {
        host: { select: { id: true, name: true, avatar: true } },
        venue: { select: { id: true, name: true } },
        _count: { select: { rsvps: { where: { status: 'confirmed' } } } },
      },
      take: Number(limit),
      orderBy: { dateTime: 'asc' },
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
};
