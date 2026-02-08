# MatchUp - Pickup Sports Platform

A pickup sports platform focused on Nepal, enabling players to discover, join, and host pickup games for football, cricket, basketball, volleyball, and badminton.

## Tech Stack

### Frontend (Mobile)
- React Native + Expo
- Expo Router for navigation
- React Native Paper for UI
- Zustand for state management
- react-native-maps for location

### Backend
- Node.js + Express.js
- PostgreSQL with Prisma ORM
- Socket.io for real-time updates
- JWT authentication

## Project Structure

```
matchup/
├── apps/
│   └── mobile/          # React Native (Expo) app
├── server/              # Node.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── prisma/
└── packages/
    └── shared/          # Shared TypeScript types
```

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Expo CLI (`npm install -g expo-cli`)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install mobile dependencies
cd apps/mobile && npm install
```

### 2. Database Setup

```bash
# Copy environment file
cd server
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/matchup"

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

### 3. Start Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start mobile app
cd apps/mobile
npx expo start
```

### 4. Mobile App Setup

```bash
cd apps/mobile
cp .env.example .env

# Edit .env with your API URL
# EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Games
- `GET /api/games` - List games (with filters)
- `GET /api/games/:id` - Get game details
- `POST /api/games` - Create a game
- `PATCH /api/games/:id` - Update a game
- `POST /api/games/:id/join` - Join a game
- `POST /api/games/:id/leave` - Leave a game
- `GET /api/games/my/joined` - Get joined games
- `GET /api/games/my/hosted` - Get hosted games

### Venues
- `GET /api/venues` - List venues
- `GET /api/venues/:id` - Get venue details

### Users
- `GET /api/users/profile` - Get profile
- `PATCH /api/users/profile` - Update profile
- `POST /api/users/push-token` - Register push token

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

## Environment Variables

### Server (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3000
SPARROW_SMS_TOKEN=your-sms-token (optional)
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Testing

```bash
# Run server tests
cd server && npm test
```

## Deployment

### Backend
Recommended platforms:
- Railway
- Render
- Supabase (for PostgreSQL)

### Mobile
```bash
# Build for production
cd apps/mobile
eas build --platform android
eas build --platform ios
```

## License

MIT
