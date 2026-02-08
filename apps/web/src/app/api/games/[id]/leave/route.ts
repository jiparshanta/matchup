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
    });

    if (!game) {
      return errorResponse('Game not found', 404);
    }

    if (game.hostId === user.id) {
      return errorResponse('Host cannot leave the game');
    }

    const rsvp = await prisma.rSVP.findUnique({
      where: {
        gameId_userId: {
          gameId,
          userId: user.id,
        },
      },
    });

    if (!rsvp) {
      return errorResponse('Not joined this game');
    }

    await prisma.rSVP.delete({
      where: { id: rsvp.id },
    });

    // If someone was confirmed, promote from waitlist
    if (rsvp.status === 'confirmed') {
      const nextWaitlisted = await prisma.rSVP.findFirst({
        where: {
          gameId,
          status: 'waitlisted',
        },
        orderBy: { createdAt: 'asc' },
      });

      if (nextWaitlisted) {
        await prisma.rSVP.update({
          where: { id: nextWaitlisted.id },
          data: { status: 'confirmed' },
        });
      }
    }

    return successResponse(undefined, 'Left the game');
  } catch (error) {
    console.error('Leave game error:', error);
    return errorResponse('Failed to leave game', 500);
  }
}
