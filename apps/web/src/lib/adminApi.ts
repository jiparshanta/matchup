import type {
  ApiResponse,
  PaginatedResponse,
  AdminStats,
  AdminUserListItem,
  AdminGameListItem,
  AdminVenueListItem,
  User,
  Venue,
  CreateVenueDTO,
  UpdateVenueDTO,
  BanUserDTO,
  UserRole,
} from '@matchup/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'An error occurred');
  }

  return data;
}

// Admin Stats API
export const adminStatsApi = {
  getStats: async (): Promise<ApiResponse<AdminStats>> => {
    return fetchWithAuth('/api/admin/stats');
  },
};

// Admin Users API
export const adminUsersApi = {
  list: async (params?: {
    search?: string;
    role?: UserRole;
    isBanned?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AdminUserListItem>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchWithAuth(`/api/admin/users${query ? `?${query}` : ''}`);
  },

  get: async (id: string): Promise<ApiResponse<User & {
    hostedGames: { id: string; title: string; sport: string; dateTime: string; status: string }[];
    rsvps: { id: string; status: string; game: { id: string; title: string; sport: string; dateTime: string } }[];
  }>> => {
    return fetchWithAuth(`/api/admin/users/${id}`);
  },

  update: async (id: string, data: { name?: string; email?: string; role?: UserRole }): Promise<ApiResponse<User>> => {
    return fetchWithAuth(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  ban: async (id: string, data?: BanUserDTO): Promise<ApiResponse<User>> => {
    return fetchWithAuth(`/api/admin/users/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  unban: async (id: string): Promise<ApiResponse<User>> => {
    return fetchWithAuth(`/api/admin/users/${id}/unban`, {
      method: 'POST',
    });
  },
};

// Admin Games API
export const adminGamesApi = {
  list: async (params?: {
    search?: string;
    sport?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AdminGameListItem>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchWithAuth(`/api/admin/games${query ? `?${query}` : ''}`);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth(`/api/admin/games/${id}`, {
      method: 'DELETE',
    });
  },
};

// Admin Venues API
export const adminVenuesApi = {
  list: async (params?: {
    search?: string;
    isPartner?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AdminVenueListItem>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchWithAuth(`/api/admin/venues${query ? `?${query}` : ''}`);
  },

  get: async (id: string): Promise<ApiResponse<Venue & {
    games: { id: string; title: string; sport: string; dateTime: string; status: string }[];
  }>> => {
    return fetchWithAuth(`/api/admin/venues/${id}`);
  },

  create: async (data: CreateVenueDTO): Promise<ApiResponse<Venue>> => {
    return fetchWithAuth('/api/admin/venues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: UpdateVenueDTO): Promise<ApiResponse<Venue>> => {
    return fetchWithAuth(`/api/admin/venues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth(`/api/admin/venues/${id}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };
