import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUser, errorResponse, successResponse } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const rsvps = await prisma.rSVP.findMany({
      where: {
        userId: user.id,
        game: { hostId: { not: user.id } }, // Exclude hosted games
      },
      include: {
        game: {
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
        },
      },
      orderBy: { game: { dateTime: 'desc' } },
    });

    const games = rsvps.map((rsvp) => ({
      ...rsvp.game,
      currentPlayers: rsvp.game._count.rsvps,
      myStatus: rsvp.status,
      _count: undefined,
    }));

    return successResponse(games);
  } catch (error) {
    console.error('Get joined games error:', error);
    return errorResponse('Failed to fetch games', 500);
  }
}
