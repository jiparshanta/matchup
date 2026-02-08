import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUser, errorResponse, successResponse } from '@/lib/server/auth';

// GET /api/games - List games
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const skillLevel = searchParams.get('skillLevel');
    const status = searchParams.get('status') || 'upcoming';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {
      status: status as string,
    };

    if (sport && sport !== 'all') {
      where.sport = sport;
    }

    if (skillLevel && skillLevel !== 'all') {
      where.skillLevel = skillLevel;
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
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
        orderBy: { dateTime: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.game.count({ where }),
    ]);

    const gamesWithCount = games.map((game) => ({
      ...game,
      currentPlayers: game._count.rsvps,
      _count: undefined,
    }));

    // Return paginated response - data array at top level with pagination
    return Response.json({
      success: true,
      data: gamesWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List games error:', error);
    return errorResponse('Failed to fetch games', 500);
  }
}

// POST /api/games - Create game
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
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
      minPlayers,
      skillLevel,
      description,
      price,
    } = body;

    // Validate required fields
    if (!title || !sport || !latitude || !longitude || !dateTime || !maxPlayers) {
      return errorResponse('Missing required fields');
    }

    const game = await prisma.game.create({
      data: {
        title,
        sport,
        hostId: user.id,
        venueId: venueId || null,
        customLocation: customLocation || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        dateTime: new Date(dateTime),
        duration: parseInt(duration) || 60,
        maxPlayers: parseInt(maxPlayers),
        minPlayers: parseInt(minPlayers) || 2,
        skillLevel: skillLevel || 'any',
        description,
        price: price ? parseInt(price) : null,
      },
      include: {
        host: {
          select: { id: true, name: true, avatar: true },
        },
        venue: {
          select: { id: true, name: true, address: true },
        },
      },
    });

    // Auto-join host to the game
    await prisma.rSVP.create({
      data: {
        gameId: game.id,
        userId: user.id,
        status: 'confirmed',
      },
    });

    return successResponse(game);
  } catch (error) {
    console.error('Create game error:', error);
    return errorResponse('Failed to create game', 500);
  }
}
