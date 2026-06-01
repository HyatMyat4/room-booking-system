import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.room.findMany();
  }

  async create(dto: CreateRoomDto, currentUser: User) {
    if (currentUser.role !== 'admin') throw new ForbiddenException('Admin access required');
    return this.prisma.room.create({
      data: {
        name: dto.name.trim(),
        capacity: dto.capacity ?? 4,
        floor: dto.floor ?? 1,
        amenities: dto.amenities ?? '',
        description: dto.description ?? '',
      },
    });
  }

  async update(id: number, dto: UpdateRoomDto, currentUser: User) {
    if (currentUser.role !== 'admin') throw new ForbiddenException('Admin access required');
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    return this.prisma.room.update({ where: { id }, data: dto });
  }

  async remove(id: number, currentUser: User) {
    if (currentUser.role !== 'admin') throw new ForbiddenException('Admin access required');
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    // Bookings are cascade-deleted via Prisma schema (onDelete: Cascade)
    await this.prisma.room.delete({ where: { id } });
    return { success: true };
  }
}
