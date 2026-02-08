import { PrismaClient, Sport, SkillLevel, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample venues in Kathmandu
  const venues = await Promise.all([
    prisma.venue.create({
      data: {
        name: 'Futsal Arena Thamel',
        address: 'Thamel, Kathmandu',
        latitude: 27.7152,
        longitude: 85.3123,
        sports: [Sport.football],
        pricePerHour: 2500,
        images: [],
        amenities: ['Changing Room', 'Parking', 'Water'],
        isPartner: true,
        contactPhone: '+9779841234567',
      },
    }),
    prisma.venue.create({
      data: {
        name: 'NBA Courts Lazimpat',
        address: 'Lazimpat, Kathmandu',
        latitude: 27.7200,
        longitude: 85.3180,
        sports: [Sport.basketball],
        pricePerHour: 1500,
        images: [],
        amenities: ['Outdoor Court', 'Lighting'],
        isPartner: false,
      },
    }),
    prisma.venue.create({
      data: {
        name: 'Cricket Ground Kirtipur',
        address: 'Kirtipur, Kathmandu',
        latitude: 27.6766,
        longitude: 85.2773,
        sports: [Sport.cricket],
        pricePerHour: 5000,
        images: [],
        amenities: ['Full Ground', 'Pavilion', 'Nets'],
        isPartner: true,
        contactPhone: '+9779851234567',
      },
    }),
    prisma.venue.create({
      data: {
        name: 'Sports Complex Balaju',
        address: 'Balaju, Kathmandu',
        latitude: 27.7333,
        longitude: 85.3000,
        sports: [Sport.volleyball, Sport.badminton, Sport.basketball],
        pricePerHour: 1000,
        images: [],
        amenities: ['Indoor Courts', 'Showers', 'Cafeteria'],
        isPartner: true,
        contactPhone: '+9779861234567',
      },
    }),
    prisma.venue.create({
      data: {
        name: 'Goal Futsal Patan',
        address: 'Patan, Lalitpur',
        latitude: 27.6588,
        longitude: 85.3247,
        sports: [Sport.football],
        pricePerHour: 2000,
        images: [],
        amenities: ['Turf Ground', 'Changing Room'],
        isPartner: false,
      },
    }),
  ]);

  console.log(`Created ${venues.length} venues`);

  // Hash password for demo users
  const passwordHash = await bcrypt.hash('demo123456', 12);

  // Create demo users
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@matchup.com' },
    update: {},
    create: {
      email: 'demo@matchup.com',
      passwordHash,
      name: 'Demo User',
      phone: '+9779800000000',
      isVerified: true,
      role: UserRole.user,
      preferredSports: [Sport.football, Sport.basketball],
      skillLevels: {
        football: 'intermediate',
        basketball: 'beginner',
      },
    },
  });

  console.log(`Created demo user: ${demoUser.name} (${demoUser.email})`);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@matchup.com' },
    update: {},
    create: {
      email: 'admin@matchup.com',
      passwordHash,
      name: 'Admin User',
      phone: '+9779800000001',
      isVerified: true,
      role: UserRole.admin,
      preferredSports: [Sport.football, Sport.cricket, Sport.basketball],
      skillLevels: {
        football: 'advanced',
        cricket: 'intermediate',
        basketball: 'intermediate',
      },
    },
  });

  console.log(`Created admin user: ${adminUser.name} (${adminUser.email})`);

  // Create some sample games
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(17, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(18, 0, 0, 0);

  const games = await Promise.all([
    prisma.game.create({
      data: {
        title: 'Evening Futsal Match',
        sport: Sport.football,
        hostId: demoUser.id,
        venueId: venues[0].id,
        latitude: venues[0].latitude,
        longitude: venues[0].longitude,
        dateTime: tomorrow,
        duration: 60,
        maxPlayers: 10,
        minPlayers: 6,
        skillLevel: SkillLevel.any,
        description: 'Friendly futsal match, all skill levels welcome!',
        price: 250,
      },
    }),
    prisma.game.create({
      data: {
        title: 'Weekend Basketball',
        sport: Sport.basketball,
        hostId: demoUser.id,
        venueId: venues[1].id,
        latitude: venues[1].latitude,
        longitude: venues[1].longitude,
        dateTime: nextWeek,
        duration: 90,
        maxPlayers: 10,
        minPlayers: 6,
        skillLevel: SkillLevel.intermediate,
        description: '5v5 basketball game. Looking for players who know the basics.',
      },
    }),
    prisma.game.create({
      data: {
        title: 'Cricket Practice Session',
        sport: Sport.cricket,
        hostId: demoUser.id,
        venueId: venues[2].id,
        latitude: venues[2].latitude,
        longitude: venues[2].longitude,
        dateTime: nextWeek,
        duration: 180,
        maxPlayers: 22,
        minPlayers: 12,
        skillLevel: SkillLevel.any,
        description: 'Net practice and friendly match. Gear provided.',
        price: 300,
      },
    }),
  ]);

  console.log(`Created ${games.length} sample games`);

  // Auto-RSVP host for all games
  await Promise.all(
    games.map((game) =>
      prisma.rSVP.create({
        data: {
          gameId: game.id,
          userId: demoUser.id,
          status: 'confirmed',
        },
      })
    )
  );

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
