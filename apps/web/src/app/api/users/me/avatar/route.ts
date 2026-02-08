import { NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUser, errorResponse, successResponse } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // In production, you would upload to a cloud storage service (S3, Cloudinary, etc.)
    // For now, we'll create a data URL (not recommended for production)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Update user avatar
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: dataUrl },
    });

    return successResponse({ url: dataUrl }, 'Avatar uploaded');
  } catch (error) {
    console.error('Avatar upload error:', error);
    return errorResponse('Failed to upload avatar', 500);
  }
}
