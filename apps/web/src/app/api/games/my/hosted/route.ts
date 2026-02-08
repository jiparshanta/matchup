import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUser, errorResponse, successResponse } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const games = await prisma.game.findMany({
      where: { hostId: user.id },
      include: {
        host: {
          select: { id: true, name: true, avatar: true },
        },
        venue: {
          select: { id: true, name: true, address: true },
        },
        _count: {
          select: { rsvps: { where: { status: 'confirmed' } } },
        },
      },
      orderBy: { dateTime: 'desc' },
    });

    const gamesWithCount = games.map((game) => ({
      ...game,
      currentPlayers: game._count.rsvps,
      _count: undefined,
    }));

    return successResponse(gamesWithCount);
  } catch (error) {
    console.error('Get hosted games error:', error);
    return errorResponse('Failed to fetch games', 500);
  }
}
