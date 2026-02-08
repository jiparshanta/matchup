import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUser, errorResponse, successResponse } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: { read: true },
    });

    return successResponse(undefined, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return errorResponse('Failed to mark notifications as read', 500);
  }
}
