import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';  

@Module({
  imports: [AuthModule], 
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
