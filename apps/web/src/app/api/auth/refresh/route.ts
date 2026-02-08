import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/server/prisma';
import { generateTokens, errorResponse, successResponse } from '@/lib/server/auth';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return errorResponse('Refresh token required', 400);
    }

    // Verify refresh token
    let payload: { userId: string };
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    } catch {
      return errorResponse('Invalid refresh token', 401);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return errorResponse('User not found', 401);
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    return successResponse({ tokens }, 'Token refreshed');
  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse('Failed to refresh token', 500);
  }
}
