import { Module } from '@nestjs/common';
import { UserServiceChargesService } from './user-service-charges.service';
import { UserServiceChargesController } from './user-service-charges.controller';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
  controllers: [UserServiceChargesController],
  providers: [UserServiceChargesService, PrismaService],
})
export class UserServiceChargesModule {}
