import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUser, errorResponse, successResponse } from '@/lib/server/auth';

// GET /api/games/[id] - Get game details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    const gameId = params.id;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        host: {
          select: { id: true, name: true, avatar: true, phone: true },
        },
        venue: {
          select: { id: true, name: true, address: true },
        },
        rsvps: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!game) {
      return errorResponse('Game not found', 404);
    }

    const confirmedPlayers = game.rsvps
      .filter((r) => r.status === 'confirmed')
      .map((r) => r.user);

    const waitlistedPlayers = game.rsvps
      .filter((r) => r.status === 'waitlisted')
      .map((r) => r.user);

    const userRsvp = user
      ? game.rsvps.find((r) => r.userId === user.id)
      : null;

    return successResponse({
      ...game,
      currentPlayers: confirmedPlayers.length,
      waitlistCount: waitlistedPlayers.length,
      confirmedPlayers,
      waitlistedPlayers,
      userRsvpStatus: userRsvp?.status || null,
      isHost: user?.id === game.hostId,
      rsvps: undefined,
    });
  } catch (error) {
    console.error('Get game error:', error);
    return errorResponse('Failed to fetch game', 500);
  }
}

// PATCH /api/games/[id] - Update game
export async function PATCH(
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

    if (game.hostId !== user.id && user.role !== 'admin') {
      return errorResponse('Not authorized to update this game', 403);
    }

    const body = await request.json();
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: body,
      include: {
        host: {
          select: { id: true, name: true, avatar: true },
        },
        venue: {
          select: { id: true, name: true, address: true },
        },
      },
    });

    return successResponse(updatedGame);
  } catch (error) {
    console.error('Update game error:', error);
    return errorResponse('Failed to update game', 500);
  }
}

// DELETE /api/games/[id] - Delete game
export async function DELETE(
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

    if (game.hostId !== user.id && user.role !== 'admin') {
      return errorResponse('Not authorized to delete this game', 403);
    }

    await prisma.game.delete({
      where: { id: gameId },
    });

    return successResponse(undefined, 'Game deleted');
  } catch (error) {
    console.error('Delete game error:', error);
    return errorResponse('Failed to delete game', 500);
  }
}
