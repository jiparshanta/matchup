import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash password for demo user
  const passwordHash = await bcrypt.hash('demo123456', 12);

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@matchup.com' },
    update: {},
    create: {
      email: 'demo@matchup.com',
      passwordHash,
      name: 'Demo User',
      phone: '+9779800000000',
      isVerified: true,
      role: 'user',
      preferredSports: ['football', 'basketball'],
      skillLevels: {
        football: 'intermediate',
        basketball: 'beginner',
      },
    },
  });

  console.log(`Created demo user: ${demoUser.name} (${demoUser.email})`);

  // Create sample venues in Kathmandu
  const venues = await Promise.all([
    prisma.venue.upsert({
      where: { id: 'venue-1' },
      update: {},
      create: {
        id: 'venue-1',
        name: 'Futsal Arena Thamel',
        address: 'Thamel, Kathmandu',
        latitude: 27.7152,
        longitude: 85.3123,
        sports: ['football'],
        pricePerHour: 2500,
        images: [],
        amenities: ['Changing Room', 'Parking', 'Water'],
        isPartner: true,
        contactPhone: '+9779841234567',
      },
    }),
    prisma.venue.upsert({
      where: { id: 'venue-2' },
      update: {},
      create: {
        id: 'venue-2',
        name: 'NBA Courts Lazimpat',
        address: 'Lazimpat, Kathmandu',
        latitude: 27.72,
        longitude: 85.318,
        sports: ['basketball'],
        pricePerHour: 1500,
        images: [],
        amenities: ['Outdoor Court', 'Lighting'],
        isPartner: false,
      },
    }),
    prisma.venue.upsert({
      where: { id: 'venue-3' },
      update: {},
      create: {
        id: 'venue-3',
        name: 'Sports Complex Balaju',
        address: 'Balaju, Kathmandu',
        latitude: 27.7333,
        longitude: 85.3,
        sports: ['volleyball', 'badminton', 'basketball'],
        pricePerHour: 1000,
        images: [],
        amenities: ['Indoor Courts', 'Showers', 'Cafeteria'],
        isPartner: true,
        contactPhone: '+9779861234567',
      },
    }),
  ]);

  console.log(`Created ${venues.length} venues`);

  // Create sample games
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(17, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(18, 0, 0, 0);

  const game1 = await prisma.game.upsert({
    where: { id: 'game-1' },
    update: {},
    create: {
      id: 'game-1',
      title: 'Evening Futsal Match',
      sport: 'football',
      hostId: demoUser.id,
      venueId: venues[0].id,
      latitude: venues[0].latitude,
      longitude: venues[0].longitude,
      dateTime: tomorrow,
      duration: 60,
      maxPlayers: 10,
      minPlayers: 6,
      skillLevel: 'any',
      description: 'Friendly futsal match, all skill levels welcome!',
      price: 250,
    },
  });

  const game2 = await prisma.game.upsert({
    where: { id: 'game-2' },
    update: {},
    create: {
      id: 'game-2',
      title: 'Weekend Basketball',
      sport: 'basketball',
      hostId: demoUser.id,
      venueId: venues[1].id,
      latitude: venues[1].latitude,
      longitude: venues[1].longitude,
      dateTime: nextWeek,
      duration: 90,
      maxPlayers: 10,
      minPlayers: 6,
      skillLevel: 'intermediate',
      description: '5v5 basketball game. Looking for players who know the basics.',
    },
  });

  console.log('Created sample games');

  // Auto-RSVP host for games
  await prisma.rSVP.upsert({
    where: { gameId_userId: { gameId: game1.id, userId: demoUser.id } },
    update: {},
    create: {
      gameId: game1.id,
      userId: demoUser.id,
      status: 'confirmed',
    },
  }).catch(() => {});

  await prisma.rSVP.upsert({
    where: { gameId_userId: { gameId: game2.id, userId: demoUser.id } },
    update: {},
    create: {
      gameId: game2.id,
      userId: demoUser.id,
      status: 'confirmed',
    },
  }).catch(() => {});

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
