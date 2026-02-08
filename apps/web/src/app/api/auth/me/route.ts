import { NextRequest } from 'next/server';
import { getAuthUser, errorResponse, successResponse } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get me error:', error);
    return errorResponse('Failed to get user', 500);
  }
}
