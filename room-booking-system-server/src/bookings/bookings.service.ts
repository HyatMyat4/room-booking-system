import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.booking.findMany({ orderBy: { startTime: 'asc' } });
  }

  async create(dto: CreateBookingDto, currentUser: User) {
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
    });

    if (!room) throw new NotFoundException('Room not found');

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Use ISO 8601 (e.g. 2026-06-01T09:00:00Z)',
      );
    }

    if (start >= end) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const conflict = await this.prisma.booking.findFirst({
      where: {
        roomId: dto.roomId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (conflict) {
      const fmtStart = start.toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
      });
      const fmtEnd = end.toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      throw new BadRequestException(
        `This time slot has already been taken — ${fmtStart} – ${fmtEnd}. Please choose a different time range.`,
      );
    }

    // ===============================
    // CREATE BOOKING
    // ===============================
    return this.prisma.booking.create({
      data: {
        userId: currentUser.id,
        roomId: dto.roomId,
        startTime: start,
        endTime: end,
      },
    });
  }

  async remove(id: number, currentUser: User) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    const canDelete =
      currentUser.role === 'admin' ||
      currentUser.role === 'owner' ||
      booking.userId === currentUser.id;
    if (!canDelete) throw new ForbiddenException('Cannot delete this booking');

    await this.prisma.booking.delete({ where: { id } });
    return { success: true };
  }
}
