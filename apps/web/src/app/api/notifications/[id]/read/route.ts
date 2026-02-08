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

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    if (notification.userId !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    await prisma.notification.update({
      where: { id: params.id },
      data: { read: true },
    });

    return successResponse(undefined, 'Notification marked as read');
  } catch (error) {
    console.error('Mark notification read error:', error);
    return errorResponse('Failed to mark notification as read', 500);
  }
}
