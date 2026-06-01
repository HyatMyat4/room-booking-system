import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(currentUser: User) {
    if (currentUser.role !== 'admin' && currentUser.role !== 'owner') {
      throw new ForbiddenException('Owner or Admin access required');
    }

    const users = await this.prisma.user.findMany({
      include: { bookings: { include: { room: true }, orderBy: { startTime: 'asc' } } },
    });

    const rooms = await this.prisma.room.findMany({
      include: { _count: { select: { bookings: true } } },
    });

    const stats = users.map((u) => ({
      userId: u.id,
      userName: u.name,
      totalBookings: u.bookings.length,
    }));

    const grouped = users.map((u) => ({
      userId: u.id,
      userName: u.name,
      bookings: u.bookings.map((b) => ({ ...b, roomName: b.room.name })),
    }));

    const roomStats = rooms.map((r) => ({
      roomId: r.id,
      roomName: r.name,
      totalBookings: r._count.bookings,
    }));

    return { stats, grouped, roomStats };
  }
}
