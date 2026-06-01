import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthGuard } from './common/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({ global: true, secret: 'room-booking-jwt-secret', signOptions: { expiresIn: '15m' } }),
    AuthModule,
    UsersModule,
    RoomsModule,
    BookingsModule,
    SummaryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
