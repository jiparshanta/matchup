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

### Frontend
| Layer | Technology | Reason |
|-------|------------|--------|
| Mobile | **React Native + Expo** | Single codebase for iOS/Android, fast iteration |
| Web | **Expo Web** or **Next.js** | Share components with mobile, SEO for web |
| UI Library | **React Native Paper** or **Tamagui** | Cross-platform components |
| Maps | **react-native-maps** + Google Maps API | Location-based game discovery |
| State | **Zustand** or **Redux Toolkit** | Simple, performant state management |

### Backend
| Layer | Technology | Reason |
|-------|------------|--------|
| Runtime | **Node.js 20+** | JavaScript everywhere, great ecosystem |
| Framework | **Express.js** or **Fastify** | Simple, well-documented, solo-dev friendly |
| Database | **PostgreSQL** | Robust, supports geospatial queries (PostGIS) |
| ORM | **Prisma** | Type-safe, great DX, easy migrations |
| Auth | **JWT + Passport.js** | Flexible, supports social login |
| Real-time | **Socket.io** | Chat, live game updates, notifications |
| File Storage | **Cloudinary** | Image optimization, free tier generous |

### Infrastructure (Solo Dev Friendly)
| Service | Provider | Cost |
|---------|----------|------|
| Backend Hosting | **Railway** or **Render** | Free tier, easy deployment |
| Database | **Supabase** (PostgreSQL) | Free tier, managed, real-time built-in |
| Mobile Builds | **Expo EAS** | Free for limited builds |
| Push Notifications | **Expo Push** or **OneSignal** | Free tier available |
| Analytics | **PostHog** or **Mixpanel** | Free tier for startups |

### Nepal-Specific Integrations
| Feature | Provider |
|---------|----------|
| Payments | **eSewa**, **Khalti**, **IME Pay** |
| SMS OTP | **Sparrow SMS**, **Aakash SMS** |
| Maps | Google Maps (works well in Nepal) |

---

## Database Schema Design

### Core Entities

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Users       │────<│   GamePlayers   │>────│     Games       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│  PlayerProfiles │                           │     Venues      │
└─────────────────┘                           └─────────────────┘
```

### Tables

#### users
```sql
- id: UUID (PK)
- phone: VARCHAR(15) UNIQUE (primary auth for Nepal)
- email: VARCHAR(255) UNIQUE (optional)
- password_hash: VARCHAR(255)
- full_name: VARCHAR(100)
- avatar_url: TEXT
- is_verified: BOOLEAN
- is_premium: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### player_profiles
```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- preferred_sports: JSONB (array of sport enums)
- skill_levels: JSONB ({football: 'intermediate', cricket: 'beginner'})
- location_lat: DECIMAL(10, 8)
- location_lng: DECIMAL(11, 8)
- bio: TEXT
- games_played: INTEGER
- rating: DECIMAL(3, 2)
- total_ratings: INTEGER
```

#### sports
```sql
- id: UUID (PK)
- name: VARCHAR(50) (football, cricket, basketball, etc.)
- name_np: VARCHAR(50) (Nepali name)
- icon_url: TEXT
- min_players: INTEGER
- max_players: INTEGER
- is_active: BOOLEAN
```

#### venues
```sql
- id: UUID (PK)
- name: VARCHAR(200)
- address: TEXT
- location_lat: DECIMAL(10, 8)
- location_lng: DECIMAL(11, 8)
- city: VARCHAR(100)
- supported_sports: JSONB
- amenities: JSONB (parking, changing_room, water, etc.)
- images: JSONB (array of URLs)
- hourly_rate: DECIMAL(10, 2)
- contact_phone: VARCHAR(15)
- is_partner: BOOLEAN (partnered venues get featured)
- owner_user_id: UUID (FK -> users, nullable)
- rating: DECIMAL(3, 2)
- created_at: TIMESTAMP
```

#### games
```sql
- id: UUID (PK)
- host_user_id: UUID (FK -> users)
- sport_id: UUID (FK -> sports)
- venue_id: UUID (FK -> venues, nullable for public spaces)
- title: VARCHAR(200)
- description: TEXT
- game_date: DATE
- start_time: TIME
- end_time: TIME
- min_players: INTEGER
- max_players: INTEGER
- current_players: INTEGER
- skill_level: ENUM('any', 'beginner', 'intermediate', 'advanced')
- fee_per_player: DECIMAL(10, 2) (0 for free games)
- is_private: BOOLEAN
- invite_code: VARCHAR(10) (for private games)
- status: ENUM('upcoming', 'full', 'in_progress', 'completed', 'cancelled')
- location_lat: DECIMAL(10, 8)
- location_lng: DECIMAL(11, 8)
- location_name: VARCHAR(200) (for non-venue locations)
- created_at: TIMESTAMP
```

#### game_players
```sql
- id: UUID (PK)
- game_id: UUID (FK -> games)
- user_id: UUID (FK -> users)
- status: ENUM('confirmed', 'waitlist', 'cancelled', 'no_show')
- joined_at: TIMESTAMP
- payment_status: ENUM('pending', 'paid', 'refunded')
- payment_amount: DECIMAL(10, 2)
```

#### game_messages (chat)
```sql
- id: UUID (PK)
- game_id: UUID (FK -> games)
- user_id: UUID (FK -> users)
- message: TEXT
- created_at: TIMESTAMP
```

#### reviews
```sql
- id: UUID (PK)
- reviewer_id: UUID (FK -> users)
- reviewee_id: UUID (FK -> users, nullable)
- venue_id: UUID (FK -> venues, nullable)
- game_id: UUID (FK -> games)
- rating: INTEGER (1-5)
- comment: TEXT
- created_at: TIMESTAMP
```

#### notifications
```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- type: ENUM('game_reminder', 'player_joined', 'game_cancelled', etc.)
- title: VARCHAR(200)
- body: TEXT
- data: JSONB
- is_read: BOOLEAN
- created_at: TIMESTAMP
```

---

## Feature Breakdown

### Phase 1: MVP (Game Discovery + Joining)
**Timeline: 6-8 weeks**

#### User Authentication
- [ ] Phone number + OTP login (primary for Nepal)
- [ ] Google OAuth (optional)
- [ ] Basic profile setup (name, avatar, preferred sports)

#### Game Discovery
- [ ] Map view showing nearby games (Google Maps)
- [ ] List view with filters (sport, date, skill level, distance)
- [ ] Game detail page (time, venue, players, host info)
- [ ] Search by location/area

#### Join Games
- [ ] One-tap join for free games
- [ ] Waitlist system when game is full
- [ ] Leave/cancel participation
- [ ] View joined games in "My Games"

#### Basic Hosting
- [ ] Create a game form (sport, date, time, location, players needed)
- [ ] Set as free or paid
- [ ] Cancel game functionality
- [ ] View RSVPs

#### Notifications
- [ ] Push notifications (game reminders, player joined, game cancelled)
- [ ] In-app notification center

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

#### Ads Integration
- [ ] Google AdMob for free tier
- [ ] Sponsored venue placements

---

## Project Structure

```
matchup/
├── apps/
│   ├── mobile/                 # React Native (Expo) app
│   │   ├── app/                # Expo Router screens
│   │   │   ├── (auth)/         # Auth screens
│   │   │   ├── (tabs)/         # Main tab screens
│   │   │   │   ├── index.tsx   # Home/Discover
│   │   │   │   ├── map.tsx     # Map view
│   │   │   │   ├── my-games.tsx
│   │   │   │   ├── create.tsx  # Host game
│   │   │   │   └── profile.tsx
│   │   │   ├── game/[id].tsx   # Game details
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI components
│   │   │   ├── game/           # Game-related components
│   │   │   ├── map/            # Map components
│   │   │   └── player/         # Player components
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API calls
│   │   ├── stores/             # Zustand stores
│   │   ├── utils/              # Helper functions
│   │   ├── constants/          # App constants
│   │   ├── types/              # TypeScript types
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── web/                    # Next.js web app (optional, Phase 2+)
│
├── packages/
│   └── shared/                 # Shared types, utils between apps
│       ├── types/
│       └── utils/
│
├── server/                     # Node.js backend
│   ├── src/
│   │   ├── config/             # Environment, database config
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── models/             # Prisma schema
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── sockets/            # Socket.io handlers
│   │   ├── utils/              # Helpers
│   │   ├── validators/         # Zod/Joi schemas
│   │   └── app.ts              # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                       # Documentation
├── .github/                    # CI/CD workflows
├── docker-compose.yml          # Local development
├── package.json                # Monorepo root (pnpm workspaces)
└── README.md
```

---

## API Endpoints Design

### Authentication
```
POST   /api/auth/send-otp        # Send OTP to phone
POST   /api/auth/verify-otp      # Verify OTP, return JWT
POST   /api/auth/google          # Google OAuth
POST   /api/auth/refresh         # Refresh access token
POST   /api/auth/logout          # Invalidate refresh token
```

### Users & Profiles
```
GET    /api/users/me             # Get current user
PATCH  /api/users/me             # Update profile
GET    /api/users/:id            # Get user profile (public)
POST   /api/users/me/avatar      # Upload avatar
```

### Games
```
GET    /api/games                # List games (with filters)
GET    /api/games/nearby         # Games near location
GET    /api/games/:id            # Game details
POST   /api/games                # Create game
PATCH  /api/games/:id            # Update game (host only)
DELETE /api/games/:id            # Cancel game (host only)

POST   /api/games/:id/join       # Join game
DELETE /api/games/:id/leave      # Leave game
GET    /api/games/:id/players    # List players

GET    /api/games/:id/messages   # Get chat messages
POST   /api/games/:id/messages   # Send message (via Socket.io preferred)
```

### My Games
```
GET    /api/me/games             # Games I'm part of
GET    /api/me/games/hosting     # Games I'm hosting
GET    /api/me/games/history     # Past games
```

### Venues
```
GET    /api/venues               # List venues
GET    /api/venues/nearby        # Venues near location
GET    /api/venues/:id           # Venue details
GET    /api/venues/:id/games     # Games at venue
```

### Sports
```
GET    /api/sports               # List all sports
```

### Notifications
```
GET    /api/notifications        # User's notifications
PATCH  /api/notifications/:id    # Mark as read
POST   /api/notifications/read-all
```

---

## User Flows

### Flow 1: New User Discovers and Joins a Game
```
1. Open app → See onboarding slides
2. Enter phone number → Receive OTP → Verify
3. Set name, avatar, select preferred sports
4. Land on Home/Discover screen
5. See map with game pins OR list of nearby games
6. Filter by: Sport (Football), Date (Today), Skill (Any)
7. Tap on a game card
8. View game details: Time, venue, 8/10 players, host info
9. Tap "Join Game" button
10. Confirmation: "You've joined! We'll remind you 1 hour before"
11. Game appears in "My Games" tab
```

### Flow 2: Host Creates a Game
```
1. Tap "+" or "Host Game" button
2. Select sport: Football
3. Set date and time
4. Choose location:
   - Select from venue list OR
   - Drop pin on map for public space
5. Set player count: Min 10, Max 14
6. Set skill level: Intermediate
7. Set fee: NPR 200/player OR Free
8. Add description (optional)
9. Tap "Create Game"
10. Share link to friends (WhatsApp, etc.)
11. Get notified as players join
```

### Flow 3: Game Day Experience
```
1. 1 hour before: Push notification reminder
2. Open game → See who's confirmed
3. Use in-game chat to coordinate
4. Host marks game as "Started"
5. After game: Rate players (optional)
6. Game moves to history
```

---

## Development Roadmap

### Week 1-2: Project Setup
- [ ] Initialize monorepo with pnpm workspaces
- [ ] Setup Expo project with Expo Router
- [ ] Setup Node.js + Express + TypeScript
- [ ] Setup PostgreSQL + Prisma schema
- [ ] Configure ESLint, Prettier, Husky
- [ ] Setup basic CI/CD (GitHub Actions)

### Week 3-4: Authentication
- [ ] Implement phone OTP flow (Sparrow SMS)
- [ ] JWT authentication middleware
- [ ] User registration and profile setup
- [ ] Basic profile management

### Week 5-6: Core Game Features
- [ ] Create game API + form
- [ ] Game listing with filters
- [ ] Map view with game markers
- [ ] Game detail screen
- [ ] Join/leave game functionality

### Week 7-8: Polish MVP
- [ ] Push notifications setup
- [ ] My Games screen
- [ ] Basic venue directory
- [ ] UI polish and testing
- [ ] Beta testing with local players

### Week 9+: Launch & Iterate
- [ ] Soft launch in Kathmandu
- [ ] Gather feedback
- [ ] Iterate on features
- [ ] Phase 2 development

---

## Verification & Testing Plan

### Backend Testing
```bash
# Run unit tests
cd server && npm test

# Run API tests
npm run test:api

# Test database migrations
npx prisma migrate dev
```

### Mobile Testing
```bash
# Start Expo development
cd apps/mobile && npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Build preview APK
eas build --profile preview --platform android
```

### Manual Testing Checklist
1. **Auth Flow**: Sign up with phone → OTP → Profile setup
2. **Discovery**: Open app → See games on map → Filter works
3. **Join Game**: Find game → View details → Join → See in My Games
4. **Host Game**: Create game → Set details → Publish → Players can see it
5. **Notifications**: Join game → Receive reminder notification

### Local Development Setup
```bash
# 1. Clone and install
git clone <repo>
pnpm install

# 2. Setup environment
cp server/.env.example server/.env
# Add database URL, SMS API keys, etc.

# 3. Start database (Docker)
docker-compose up -d postgres

# 4. Run migrations
cd server && npx prisma migrate dev

# 5. Start backend
npm run dev

# 6. Start mobile app
cd apps/mobile && npx expo start
```

---

## Cost Estimates (Monthly)

### MVP Phase (Low Traffic)
| Service | Cost |
|---------|------|
| Supabase (DB) | Free tier |
| Railway (Backend) | Free tier → $5 |
| Expo EAS | Free tier |
| Google Maps API | $200 free credit |
| Sparrow SMS | NPR 1/SMS (~$50 for 5000 OTPs) |
| **Total** | **~$5-55/month** |

### Growth Phase
| Service | Cost |
|---------|------|
| Supabase Pro | $25/month |
| Railway Pro | $20/month |
| Cloud Storage | $10/month |
| SMS | ~$100/month |
| **Total** | **~$155/month** |

---

## Key Files to Create First

1. `package.json` - Monorepo root with pnpm workspaces
2. `apps/mobile/app.json` - Expo configuration
3. `apps/mobile/app/(tabs)/_layout.tsx` - Tab navigation
4. `server/prisma/schema.prisma` - Database schema
5. `server/src/app.ts` - Express server setup
6. `server/src/routes/auth.ts` - Authentication routes
7. `server/src/routes/games.ts` - Game CRUD routes

---

## Next Steps After Plan Approval

1. Initialize the monorepo structure
2. Setup Expo project with navigation
3. Setup Express + Prisma backend
4. Implement authentication flow
5. Build game discovery and joining features
