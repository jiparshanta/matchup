import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { errorResponse, successResponse } from '@/lib/server/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        avatar: true,
        preferredSports: true,
        skillLevels: true,
        createdAt: true,
        // Exclude sensitive fields like phone, email
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Failed to fetch user', 500);
  }
}
