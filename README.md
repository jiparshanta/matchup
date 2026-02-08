# MatchUp - Pickup Sports Platform

A pickup sports platform focused on Nepal, enabling players to discover, join, and host pickup games for football, cricket, basketball, volleyball, and badminton.

## Tech Stack

### Frontend (Web)
- Next.js 14 (App Router)
- Tailwind CSS for styling
- React Query for data fetching
- Zustand for state management
- React Leaflet for maps
- React Hook Form + Zod for form validation
- Socket.io Client for real-time updates
- PWA support via Web App Manifest

### Backend
- Node.js + Express.js
- PostgreSQL with Prisma ORM
- Socket.io for real-time updates
- JWT authentication (access + refresh tokens)
- Vitest for testing

### Shared
- TypeScript types and interfaces shared across apps

## Project Structure

```
matchup/
├── apps/
│   └── web/                # Next.js web app
│       ├── prisma/         # Prisma schema & seed (web)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/     # Auth pages (login, signup, setup-profile)
│       │   │   ├── (main)/     # Main pages (discover, games, profile, map, etc.)
│       │   │   ├── (admin)/    # Admin dashboard pages
│       │   │   └── api/        # Next.js API routes
│       │   ├── components/     # UI and feature components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # API client, utilities, server helpers
│       │   ├── providers/      # Auth, Socket, React Query providers
│       │   └── stores/         # Zustand state stores
│       └── public/
├── server/                 # Express.js backend API
│   ├── prisma/             # Prisma schema & seed (server)
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── tests/
└── packages/
    └── shared/             # Shared TypeScript types
```

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database

### 1. Install Dependencies

```bash
# Install all dependencies (monorepo workspaces)
npm install
```

### 2. Database Setup

```bash
# Copy environment files
cp apps/web/.env.example apps/web/.env
cp server/.env.example server/.env

# Edit .env files with your database URL and secrets
# DATABASE_URL="postgresql://user:password@localhost:5432/matchup"

# Push schema to database
npm run db:push

# Seed sample data (optional)
npm run db:seed
```

### 3. Start Development

```bash
# Start the Next.js web app (port 3000)
npm run dev
```

If using the standalone Express server:

```bash
# Terminal 2: Start backend server
cd server
npm run dev
```

## Web App Environment Variables

### apps/web/.env
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### server/.env
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3000
SPARROW_SMS_TOKEN=your-sms-token (optional)
CLOUDINARY_CLOUD_NAME= (optional)
CLOUDINARY_API_KEY= (optional)
CLOUDINARY_API_SECRET= (optional)
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up with email/password
- `POST /api/auth/login` - Login with email/password
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

### Users
- `GET /api/users/me` - Get profile
- `PATCH /api/users/me` - Update profile
- `POST /api/users/me/avatar` - Upload avatar
- `GET /api/users/:id` - Get user by ID

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

## Testing

```bash
# Run server tests
cd server && npm test
```

## Deployment

### Web App (Vercel)
The project includes a `vercel.json` configured for the Next.js monorepo:
```bash
# Deploy via Vercel CLI or connect GitHub repo to Vercel
```

### Backend
Recommended platforms:
- Railway
- Render
- Fly.io

### Database
- Vercel Postgres
- Supabase
- Neon

## License

MIT
