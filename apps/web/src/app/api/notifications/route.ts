import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUser, errorResponse, successResponse } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return successResponse(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}
