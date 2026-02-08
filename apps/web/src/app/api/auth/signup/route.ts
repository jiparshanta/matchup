import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { generateTokens, hashPassword, errorResponse, successResponse } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse('Invalid email address');
    }

    // Validate password
    if (!password || password.length < 6) {
      return errorResponse('Password must be at least 6 characters');
    }

    // Validate name
    if (!name || name.length < 2 || name.length > 50) {
      return errorResponse('Name must be 2-50 characters');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Normalize phone number if provided
    let normalizedPhone = phone;
    if (phone && !phone.startsWith('+977')) {
      normalizedPhone = '+977' + phone;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone: normalizedPhone || null,
        isVerified: true, // Auto-verify for now
      },
    });

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

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
      isNewUser: true,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Failed to create account', 500);
  }
}
