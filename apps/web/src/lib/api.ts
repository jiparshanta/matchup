import type { ApiResponse, PaginatedResponse, Game, User, Notification, CreateGameDTO, UpdateGameDTO, UpdateUserDTO } from '@matchup/shared';

// Use relative URLs for Next.js API routes
const API_BASE_URL = '';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function setAuthTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearAuthTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearAuthTokens();
      return null;
    }

    const data = await response.json();
    if (data.success && data.data?.tokens) {
      setAuthTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
      return data.data.tokens.accessToken;
    }
    return null;
  } catch {
    clearAuthTokens();
    return null;
  }
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If unauthorized, try to refresh token
  if (response.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'An error occurred');
  }

  return data;
}

// Auth API
export const authApi = {
  signup: async (data: { email: string; password: string; name: string; phone?: string }): Promise<ApiResponse<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
    isNewUser: boolean;
  }>> => {
    const result = await fetchWithAuth<ApiResponse<{
      user: User;
      tokens: { accessToken: string; refreshToken: string };
      isNewUser: boolean;
    }>>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (result.success && result.data?.tokens) {
      setAuthTokens(result.data.tokens.accessToken, result.data.tokens.refreshToken);
    }

    return result;
  },

  login: async (email: string, password: string): Promise<ApiResponse<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
    isNewUser: boolean;
  }>> => {
    const result = await fetchWithAuth<ApiResponse<{
      user: User;
      tokens: { accessToken: string; refreshToken: string };
      isNewUser: boolean;
    }>>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.success && result.data?.tokens) {
      setAuthTokens(result.data.tokens.accessToken, result.data.tokens.refreshToken);
    }

    return result;
  },

  logout: async (): Promise<void> => {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } finally {
      clearAuthTokens();
    }
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    return fetchWithAuth('/api/auth/me');
  },
};

// Extended Game type with API response data
export type GameWithDetails = Game & {
  host?: { id: string; name: string; avatar?: string };
  venue?: { id: string; name: string; address: string };
  currentPlayers: number;
  distance?: number;
};

// Games API
export const gamesApi = {
  list: async (params?: {
    sport?: string;
    skillLevel?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<GameWithDetails>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchWithAuth(`/api/games${query ? `?${query}` : ''}`);
  },

  get: async (id: string): Promise<ApiResponse<Game & {
    currentPlayers: number;
    waitlistCount: number;
    confirmedPlayers: { id: string; name: string; avatar?: string }[];
    waitlistedPlayers: { id: string; name: string; avatar?: string }[];
    userRsvpStatus: string | null;
    isHost: boolean;
  }>> => {
    return fetchWithAuth(`/api/games/${id}`);
  },

  create: async (data: CreateGameDTO): Promise<ApiResponse<Game>> => {
    return fetchWithAuth('/api/games', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: UpdateGameDTO): Promise<ApiResponse<Game>> => {
    return fetchWithAuth(`/api/games/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  join: async (id: string): Promise<ApiResponse<{ status: string; message: string }>> => {
    return fetchWithAuth(`/api/games/${id}/join`, { method: 'POST' });
  },

  leave: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth(`/api/games/${id}/leave`, { method: 'POST' });
  },

  myHosted: async (): Promise<ApiResponse<GameWithDetails[]>> => {
    return fetchWithAuth('/api/games/my/hosted');
  },

  myJoined: async (): Promise<ApiResponse<(GameWithDetails & { myStatus: string })[]>> => {
    return fetchWithAuth('/api/games/my/joined');
  },
};

// Users API
export const usersApi = {
  getProfile: async (id: string): Promise<ApiResponse<User>> => {
    return fetchWithAuth(`/api/users/${id}`);
  },

  updateProfile: async (data: UpdateUserDTO): Promise<ApiResponse<User>> => {
    return fetchWithAuth('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(response.status, data.error || 'Upload failed');
    }
    return data;
  },
};

// Notifications API
export const notificationsApi = {
  list: async (): Promise<ApiResponse<Notification[]>> => {
    return fetchWithAuth('/api/notifications');
  },

  markAsRead: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth(`/api/notifications/${id}/read`, { method: 'POST' });
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    return fetchWithAuth('/api/notifications/read-all', { method: 'POST' });
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return fetchWithAuth('/api/notifications/unread-count');
  },
};

export { ApiError, setAuthTokens, clearAuthTokens, getAuthToken };
