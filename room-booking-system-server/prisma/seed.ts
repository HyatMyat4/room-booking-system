import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear all tables and reset sequences
  await prisma.$executeRaw`TRUNCATE TABLE "RefreshToken", "Booking", "Room", "User" RESTART IDENTITY CASCADE`;

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.createMany({
    data: [
      { name: 'Alice Johnson', password: hashedPassword, role: 'admin' },
      { name: 'Bob Smith',     password: hashedPassword, role: 'owner' },
      { name: 'Charlie Brown', password: hashedPassword, role: 'user' },
      { name: 'Diana Prince',  password: hashedPassword, role: 'user' },
      { name: 'Eve Adams',     password: hashedPassword, role: 'user' },
      { name: 'Frank Castle',  password: hashedPassword, role: 'owner' },
    ],
  });

  await prisma.room.createMany({
    data: [
      { name: 'Conference A',   capacity: 10, floor: 1, amenities: 'Projector, Whiteboard, Zoom',          description: 'Large room with video conferencing' },
      { name: 'Meeting Room B', capacity: 6,  floor: 1, amenities: 'TV Screen, Whiteboard',                description: 'Medium room for team meetings' },
      { name: 'Board Room',     capacity: 16, floor: 2, amenities: 'Projector, Conference Phone, TV',       description: 'Executive boardroom with premium AV' },
      { name: 'Focus Room 1',   capacity: 2,  floor: 2, amenities: 'Monitor, Noise-cancelling',            description: 'Quiet room for focused work' },
      { name: 'Focus Room 2',   capacity: 2,  floor: 3, amenities: 'Monitor, Whiteboard',                  description: 'Small quiet room for pair work' },
      { name: 'Training Room',  capacity: 20, floor: 3, amenities: 'Projector, Whiteboard, Sound System',  description: 'Large room for training sessions' },
      { name: 'Huddle Space',   capacity: 4,  floor: 1, amenities: 'TV Screen, Whiteboard',                description: 'Casual huddle space near kitchen' },
      { name: 'Creative Studio',capacity: 8,  floor: 2, amenities: 'Projector, Whiteboard, Standing Desks',description: 'Flexible creative workspace' },
    ],
  });

  await prisma.booking.createMany({
    data: [
      { userId: 1, roomId: 1, startTime: new Date('2026-06-01T09:00:00Z'), endTime: new Date('2026-06-01T10:00:00Z'), createdAt: new Date('2026-05-28T08:00:00Z') },
      { userId: 1, roomId: 2, startTime: new Date('2026-06-02T14:00:00Z'), endTime: new Date('2026-06-02T15:30:00Z'), createdAt: new Date('2026-05-28T09:00:00Z') },
      { userId: 2, roomId: 3, startTime: new Date('2026-06-01T11:00:00Z'), endTime: new Date('2026-06-01T12:00:00Z'), createdAt: new Date('2026-05-29T10:00:00Z') },
      { userId: 3, roomId: 1, startTime: new Date('2026-06-03T08:00:00Z'), endTime: new Date('2026-06-03T09:00:00Z'), createdAt: new Date('2026-05-29T11:00:00Z') },
      { userId: 3, roomId: 5, startTime: new Date('2026-06-03T10:00:00Z'), endTime: new Date('2026-06-03T11:00:00Z'), createdAt: new Date('2026-05-30T12:00:00Z') },
      { userId: 4, roomId: 4, startTime: new Date('2026-06-04T13:00:00Z'), endTime: new Date('2026-06-04T14:00:00Z'), createdAt: new Date('2026-05-30T13:00:00Z') },
      { userId: 5, roomId: 7, startTime: new Date('2026-06-05T09:30:00Z'), endTime: new Date('2026-06-05T10:30:00Z'), createdAt: new Date('2026-05-31T08:00:00Z') },
      { userId: 6, roomId: 6, startTime: new Date('2026-06-05T15:00:00Z'), endTime: new Date('2026-06-05T16:00:00Z'), createdAt: new Date('2026-05-31T09:00:00Z') },
      { userId: 2, roomId: 8, startTime: new Date('2026-06-06T10:00:00Z'), endTime: new Date('2026-06-06T12:00:00Z'), createdAt: new Date('2026-05-31T10:00:00Z') },
      { userId: 4, roomId: 2, startTime: new Date('2026-06-06T09:00:00Z'), endTime: new Date('2026-06-06T10:00:00Z'), createdAt: new Date('2026-05-31T11:00:00Z') },
    ],
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
