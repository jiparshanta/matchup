import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUser, errorResponse, successResponse } from '@/lib/server/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const gameId = params.id;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        _count: {
          select: { rsvps: { where: { status: 'confirmed' } } },
        },
      },
    });

    if (!game) {
      return errorResponse('Game not found', 404);
    }

    if (game.status !== 'upcoming') {
      return errorResponse('Cannot join this game');
    }

    // Check if already joined
    const existingRsvp = await prisma.rSVP.findUnique({
      where: {
        gameId_userId: {
          gameId,
          userId: user.id,
        },
      },
    });

    if (existingRsvp) {
      return errorResponse('Already joined this game');
    }

    // Determine status (confirmed or waitlisted)
    const isFull = game._count.rsvps >= game.maxPlayers;
    const status = isFull ? 'waitlisted' : 'confirmed';

    await prisma.rSVP.create({
      data: {
        gameId,
        userId: user.id,
        status,
      },
    });

    return successResponse({
      status,
      message: isFull ? 'Added to waitlist' : 'Successfully joined!',
    });
  } catch (error) {
    console.error('Join game error:', error);
    return errorResponse('Failed to join game', 500);
  }
}
