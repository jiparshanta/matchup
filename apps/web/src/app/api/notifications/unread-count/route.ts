import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUser, errorResponse, successResponse } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    return successResponse({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    return errorResponse('Failed to fetch count', 500);
  }
}
