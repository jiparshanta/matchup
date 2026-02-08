import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { generateTokens, verifyPassword, errorResponse, successResponse } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse('Invalid email address');
    }

    // Validate password
    if (!password) {
      return errorResponse('Password is required');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if user is banned
    if (user.isBanned) {
      return errorResponse('Your account has been suspended', 403);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    // Check if profile is complete
    const isProfileComplete = user.preferredSports.length > 0;

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        preferredSports: user.preferredSports,
        skillLevels: user.skillLevels,
        role: user.role,
      },
      tokens,
      isNewUser: !isProfileComplete,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed', 500);
  }
}
