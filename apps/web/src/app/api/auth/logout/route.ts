import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/server/auth';

export async function POST(_request: NextRequest) {
  // In a more complete implementation, we would invalidate the refresh token
  // For now, the client will clear tokens from localStorage
  return successResponse(undefined, 'Logged out successfully');
}
