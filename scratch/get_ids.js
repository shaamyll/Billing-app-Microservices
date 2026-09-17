const { PrismaClient } = require('./trip-service/src/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg(
  { connectionString: 'postgresql://postgres:safeerapk11@localhost:5432/billing_user_db?schema=trip_schema' },
  { schema: 'trip_schema' }
);
const prisma = new PrismaClient({ adapter });

async function main() {
  const trip = await prisma.trip.findFirst({
    include: { bus: { include: { seats: true } } }
  });
  console.log('REAL_TRIP_ID:', trip.id);
  console.log('REAL_SEAT_ID:', trip.bus.seats[0].id, trip.bus.seats[0].seatNumber);
  await prisma.$disconnect();
}

main().catch(console.error);
