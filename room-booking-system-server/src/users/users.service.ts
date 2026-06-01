import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ omit: { password: true } });
  }

  async create(dto: CreateUserDto, currentUser: User) {
    if (currentUser.role !== 'admin') throw new ForbiddenException('Admin access required');

    const existing = await this.prisma.user.findUnique({ where: { name: dto.name.trim() } });
    if (existing) throw new BadRequestException('User with this name already exists');

    return this.prisma.user.create({
      data: { name: dto.name.trim(), password: await bcrypt.hash(dto.password, 10), role: dto.role ?? 'user' },
      omit: { password: true },
    });
  }

  async remove(id: number, currentUser: User) {
    if (currentUser.role !== 'admin') throw new ForbiddenException('Admin access required');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.id === currentUser.id) throw new BadRequestException('Cannot delete yourself');
    // Bookings are cascade-deleted via Prisma schema (onDelete: Cascade)
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async updateRole(id: number, dto: UpdateRoleDto, currentUser: User) {
    if (currentUser.role !== 'admin') throw new ForbiddenException('Admin access required');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.id === currentUser.id) throw new BadRequestException('Cannot change your own role');
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      omit: { password: true },
    });
  }
}
