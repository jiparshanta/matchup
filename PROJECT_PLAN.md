# MatchUp - Pickup Sports Platform

## Project Overview

**MatchUp** is a pickup sports platform focused on Nepal, enabling players to discover, join, and host pickup games for football, cricket, basketball, volleyball, and badminton.

### Target Market
- **Primary Region**: Nepal (Kathmandu Valley initially, then expand)
- **Primary Sport**: Football/Soccer (futsal is huge in Nepal)
- **Secondary Sports**: Cricket, Basketball, Volleyball, Badminton

### Monetization Strategy
1. **Venue Partnerships**: Commission on bookings, featured listings
2. **Freemium + Ads**: Free tier with ads, premium removes ads + extra features

---

## Tech Stack

### Frontend (Web)
| Layer | Technology | Reason |
|-------|------------|--------|
| Framework | **Next.js 14 (App Router)** | SSR/SSG, API routes, file-based routing |
| Styling | **Tailwind CSS** | Utility-first, fast iteration |
| Data Fetching | **React Query (TanStack)** | Caching, optimistic updates, server state |
| Forms | **React Hook Form + Zod** | Performant forms with schema validation |
| State | **Zustand** | Simple, lightweight client state management |
| Maps | **React Leaflet** | Free, open-source map rendering |
| Real-time | **Socket.io Client** | Live game updates, notifications |
| PWA | **Web App Manifest** | Installable on mobile devices via browser |

### Backend
| Layer | Technology | Reason |
|-------|------------|--------|
| Runtime | **Node.js 20+** | JavaScript everywhere, great ecosystem |
| Framework | **Express.js** | Simple, well-documented, solo-dev friendly |
| Database | **PostgreSQL** | Robust, supports geospatial queries |
| ORM | **Prisma** | Type-safe, great DX, easy migrations |
| Auth | **JWT (access + refresh tokens)** | Stateless, scalable authentication |
| Real-time | **Socket.io** | Live game updates, notifications |
| File Storage | **Cloudinary** | Image optimization, free tier generous |
| Testing | **Vitest** | Fast, Vite-native test runner |

### Infrastructure
| Service | Provider | Cost |
|---------|----------|------|
| Web Hosting | **Vercel** | Free tier, optimized for Next.js |
| Backend Hosting | **Railway** or **Render** | Free tier, easy deployment |
| Database | **Vercel Postgres / Supabase / Neon** | Free tier, managed PostgreSQL |
| Push Notifications | **Expo Push** or **OneSignal** | Free tier available |
| Analytics | **PostHog** or **Mixpanel** | Free tier for startups |

### Nepal-Specific Integrations
| Feature | Provider |
|---------|----------|
| Payments | **eSewa**, **Khalti**, **IME Pay** |
| SMS OTP | **Sparrow SMS**, **Aakash SMS** |
| Maps | Leaflet + OpenStreetMap (free, works in Nepal) |

---

## Database Schema Design

### Core Entities

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Users       │────<│      RSVPs      │>────│     Games       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│  Notifications  │                           │     Venues      │
└─────────────────┘                           └─────────────────┘
```

### Models (Prisma)

#### User
- id, email, name, phone (optional), avatar, preferredSports, passwordHash
- role (user/admin), skillLevels (JSON), isVerified, isBanned
- Relations: hostedGames, rsvps, notifications

#### Game
- id, title, sport, hostId, venueId (optional), customLocation
- latitude, longitude, dateTime, duration, maxPlayers, minPlayers
- skillLevel, description, status, price
- Relations: host, venue, rsvps

#### Venue
- id, name, address, latitude, longitude, sports, pricePerHour
- images, amenities, isPartner, contactPhone
- Relations: games

#### RSVP
- id, gameId, userId, status (confirmed/waitlisted/cancelled)
- Unique constraint: [gameId, userId]

#### Notification
- id, userId, title, body, type, data (JSON), read

---

## Feature Breakdown

### Phase 1: MVP (Game Discovery + Joining) - Current
**Status: In Progress**

#### User Authentication
- [x] Email/password signup and login
- [x] JWT access + refresh token flow
- [x] Profile setup (name, avatar, preferred sports)
- [x] Auth middleware and protected routes

#### Game Discovery
- [x] Map view showing nearby games (Leaflet)
- [x] List view with filters (sport, date, skill level)
- [x] Game detail page (time, venue, players, host info)
- [x] Discover page with game cards

#### Join Games
- [x] Join/leave game functionality
- [x] View joined games in "My Games"
- [x] Game status tracking

#### Game Hosting
- [x] Create game form (sport, date, time, location, players)
- [x] Edit game functionality
- [x] Set as free or paid

#### Notifications
- [x] In-app notification center
- [x] Unread count tracking
- [x] Mark as read / mark all as read

#### Admin Dashboard
- [x] Admin layout with sidebar navigation
- [x] Dashboard with stats overview
- [x] User management (list, view, ban/unban)
- [x] Game management
- [x] Venue management (list, create, edit)

### Phase 2: Enhanced Features
**Timeline: 4-6 weeks after MVP**

#### Game Chat
- [ ] Real-time group chat per game
- [ ] Share location, images

#### Player Profiles
- [ ] View other players' profiles
- [ ] Games played history
- [ ] Skill level badges
- [ ] Player ratings (post-game)

#### Venue Integration
- [ ] Venue directory with details
- [ ] Filter games by venue
- [ ] Venue photos and amenities

#### Payment Integration
- [ ] eSewa integration for paid games
- [ ] Khalti integration
- [ ] Payment history

### Phase 3: Growth Features
**Timeline: 4-6 weeks after Phase 2**

#### Venue Partnerships
- [ ] Venue owner dashboard
- [ ] Booking management
- [ ] Revenue analytics
- [ ] Featured venue listings

#### Premium Features
- [ ] Ad-free experience
- [ ] Priority game joining
- [ ] Advanced filters
- [ ] Profile badges

#### Community
- [ ] Teams/groups creation
- [ ] Recurring games
- [ ] Leaderboards
- [ ] Achievements

---

## Project Structure

```
matchup/
├── apps/
│   └── web/                      # Next.js 14 web app
│       ├── prisma/
│       │   ├── schema.prisma     # Database schema
│       │   └── seed.ts           # Seed data
│       ├── public/
│       │   └── manifest.json     # PWA manifest
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/       # Auth pages
│       │   │   │   ├── login/
│       │   │   │   ├── signup/
│       │   │   │   └── setup-profile/
│       │   │   ├── (main)/       # Main app pages
│       │   │   │   ├── discover/
│       │   │   │   ├── games/[id]/
│       │   │   │   ├── games/create/
│       │   │   │   ├── map/
│       │   │   │   ├── my-games/
│       │   │   │   ├── notifications/
│       │   │   │   └── profile/
│       │   │   ├── (admin)/      # Admin dashboard
│       │   │   │   ├── dashboard/
│       │   │   │   ├── games/
│       │   │   │   ├── users/
│       │   │   │   └── venues/
│       │   │   └── api/          # Next.js API routes
│       │   │       ├── auth/
│       │   │       ├── games/
│       │   │       ├── users/
│       │   │       └── notifications/
│       │   ├── components/
│       │   │   ├── ui/           # Reusable UI (Button, Card, Input, etc.)
│       │   │   ├── games/        # Game cards, forms, filters, player list
│       │   │   ├── layout/       # Navbar, MobileNav
│       │   │   ├── map/          # GameMap component
│       │   │   └── admin/        # Admin sidebar
│       │   ├── hooks/            # useRequireAuth, useGeolocation, useGameSocket
│       │   ├── lib/              # API client, socket, utilities
│       │   │   └── server/       # Server-side auth & prisma helpers
│       │   ├── providers/        # AuthProvider, SocketProvider
│       │   └── stores/           # Zustand auth store
│       ├── tailwind.config.ts
│       └── next.config.js
│
├── server/                       # Express.js backend (standalone)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── app.ts               # Express app setup
│   │   ├── controllers/
│   │   ├── middleware/           # Auth, admin, error handler
│   │   ├── routes/              # Auth, games, users, venues, notifications, admin
│   │   └── services/            # Prisma, socket, notifications, SMS
│   └── tests/
│
├── packages/
│   └── shared/                   # Shared TypeScript types & interfaces
│       └── src/index.ts
│
├── vercel.json                   # Vercel deployment config
└── package.json                  # Monorepo root (npm workspaces)
```

---

## API Endpoints Design

### Authentication
```
POST   /api/auth/signup          # Sign up with email/password
POST   /api/auth/login           # Login with email/password
POST   /api/auth/refresh         # Refresh access token
POST   /api/auth/logout          # Invalidate refresh token
GET    /api/auth/me              # Get current user
```

### Users & Profiles
```
GET    /api/users/me             # Get current user
PATCH  /api/users/me             # Update profile
POST   /api/users/me/avatar      # Upload avatar
GET    /api/users/:id            # Get user profile (public)
```

### Games
```
GET    /api/games                # List games (with filters)
GET    /api/games/:id            # Game details
POST   /api/games                # Create game
PATCH  /api/games/:id            # Update game (host only)

POST   /api/games/:id/join       # Join game
POST   /api/games/:id/leave      # Leave game

GET    /api/games/my/joined      # Games I've joined
GET    /api/games/my/hosted      # Games I'm hosting
```

### Notifications
```
GET    /api/notifications             # User's notifications
GET    /api/notifications/unread-count
POST   /api/notifications/:id/read    # Mark as read
POST   /api/notifications/read-all
```

---

## User Flows

### Flow 1: New User Discovers and Joins a Game
```
1. Open web app → See landing page
2. Click Sign Up → Enter email, password, name
3. Set preferred sports and skill levels
4. Land on Discover page
5. See map with game pins OR list of nearby games
6. Filter by: Sport (Football), Skill (Any)
7. Click on a game card
8. View game details: Time, venue, players, host info
9. Click "Join Game"
10. Game appears in "My Games" tab
```

### Flow 2: Host Creates a Game
```
1. Click "Create Game" from navbar
2. Select sport: Football
3. Set date and time
4. Choose location: Select venue or enter custom location
5. Set player count: Min 4, Max 14
6. Set skill level: Intermediate
7. Set fee: NPR 200/player OR Free
8. Add description (optional)
9. Click "Create Game"
10. Share link to friends
```

---

## Development Roadmap

### Week 1-2: Project Setup (Done)
- [x] Initialize monorepo with npm workspaces
- [x] Setup Next.js project with App Router
- [x] Setup Express.js + TypeScript backend
- [x] Setup PostgreSQL + Prisma schema
- [x] Configure Tailwind CSS

### Week 3-4: Authentication (Done)
- [x] Implement email/password auth flow
- [x] JWT authentication middleware
- [x] User registration and profile setup
- [x] Auth provider and protected routes

### Week 5-6: Core Game Features (Done)
- [x] Create game API + form
- [x] Game listing with filters
- [x] Map view with game markers
- [x] Game detail page
- [x] Join/leave game functionality

### Week 7-8: Polish MVP (In Progress)
- [x] Notification system
- [x] My Games page
- [x] Admin dashboard
- [ ] UI polish and testing
- [ ] Beta testing with local players

### Week 9+: Launch & Iterate
- [ ] Deploy to Vercel (web) + Railway (server)
- [ ] Soft launch in Kathmandu
- [ ] Gather feedback
- [ ] Phase 2 development

---

## Verification & Testing

### Backend Testing
```bash
# Run server tests
cd server && npm test

# Run tests once
cd server && npm run test:run
```

### Web App Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production build
npm run start
```

### Database Management
```bash
# Push schema changes
npm run db:push

# Seed sample data
npm run db:seed

# Open Prisma Studio (visual DB browser)
npm run db:studio
```

---

## Deployment

### Web App (Vercel)
The project includes `vercel.json` for monorepo deployment:
- Framework: Next.js
- Build command: `cd apps/web && npm run build`
- Output directory: `apps/web/.next`

### Backend (Railway/Render)
Deploy the `server/` directory as a standalone Node.js app.

### Database
Use any managed PostgreSQL provider:
- Vercel Postgres
- Supabase
- Neon

---

## Cost Estimates (Monthly)

### MVP Phase (Low Traffic)
| Service | Cost |
|---------|------|
| Vercel (Web) | Free tier |
| Supabase (DB) | Free tier |
| Railway (Backend) | Free tier → $5 |
| Sparrow SMS | NPR 1/SMS (~$50 for 5000 OTPs) |
| **Total** | **~$0-55/month** |

### Growth Phase
| Service | Cost |
|---------|------|
| Vercel Pro | $20/month |
| Supabase Pro | $25/month |
| Railway Pro | $20/month |
| Cloud Storage | $10/month |
| SMS | ~$100/month |
| **Total** | **~$175/month** |
