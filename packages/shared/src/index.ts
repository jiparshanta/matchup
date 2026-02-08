// Shared types for MatchUp platform

export type Sport = 'football' | 'cricket' | 'basketball' | 'volleyball' | 'badminton';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'any';

export type GameStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

export type RSVPStatus = 'confirmed' | 'waitlisted' | 'cancelled';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string; // Optional - used for contact when joining games
  avatar?: string;
  preferredSports: Sport[];
  skillLevels: Record<Sport, SkillLevel>;
  role: UserRole;
  isBanned?: boolean;
  bannedAt?: Date;
  bannedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  id: string;
  title: string;
  sport: Sport;
  hostId: string;
  host?: User;
  venueId?: string;
  venue?: Venue;
  customLocation?: string;
  latitude: number;
  longitude: number;
  dateTime: Date;
  duration: number; // minutes
  maxPlayers: number;
  minPlayers: number;
  skillLevel: SkillLevel;
  description?: string;
  status: GameStatus;
  price?: number; // in NPR
  createdAt: Date;
  updatedAt: Date;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  sports: Sport[];
  pricePerHour?: number;
  images: string[];
  amenities: string[];
  isPartner: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RSVP {
  id: string;
  gameId: string;
  userId: string;
  status: RSVPStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'game_reminder' | 'game_update' | 'rsvp_update' | 'general';
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Game filters
export interface GameFilters {
  sport?: Sport;
  skillLevel?: SkillLevel;
  dateFrom?: Date;
  dateTo?: Date;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
}

// Create/Update DTOs
export interface CreateGameDTO {
  title: string;
  sport: Sport;
  venueId?: string;
  customLocation?: string;
  latitude: number;
  longitude: number;
  dateTime: string;
  duration: number;
  maxPlayers: number;
  minPlayers: number;
  skillLevel: SkillLevel;
  description?: string;
  price?: number;
}

export interface UpdateGameDTO extends Partial<CreateGameDTO> {
  status?: GameStatus;
}

export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  avatar?: string;
  preferredSports?: Sport[];
  skillLevels?: Record<Sport, SkillLevel>;
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  totalGames: number;
  totalVenues: number;
  activeGames: number;
  recentUsers: number;
  gamesBySport: { sport: Sport; count: number }[];
}

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isBanned: boolean;
  bannedAt?: Date;
  bannedReason?: string;
  isVerified: boolean;
  createdAt: Date;
  _count: {
    hostedGames: number;
    rsvps: number;
  };
}

export interface AdminGameListItem {
  id: string;
  title: string;
  sport: Sport;
  dateTime: Date;
  status: GameStatus;
  maxPlayers: number;
  currentPlayers: number;
  host: {
    id: string;
    name: string;
  };
  venue?: {
    id: string;
    name: string;
  };
}

export interface AdminVenueListItem {
  id: string;
  name: string;
  address: string;
  sports: Sport[];
  pricePerHour?: number;
  isPartner: boolean;
  contactPhone?: string;
  createdAt: Date;
  _count: {
    games: number;
  };
}

export interface CreateVenueDTO {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  sports?: Sport[];
  pricePerHour?: number;
  images?: string[];
  amenities?: string[];
  isPartner?: boolean;
  contactPhone?: string;
}

export interface UpdateVenueDTO extends Partial<CreateVenueDTO> {}

export interface BanUserDTO {
  reason?: string;
}
