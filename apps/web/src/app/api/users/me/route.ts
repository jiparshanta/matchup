import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUser, errorResponse, successResponse } from '@/lib/server/auth';

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, email, preferredSports, skillLevels } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(preferredSports && { preferredSports }),
        ...(skillLevels && { skillLevels }),
      },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        avatar: true,
        preferredSports: true,
        skillLevels: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return errorResponse('Failed to update profile', 500);
  }
}
