import { Module } from '@nestjs/common';
import { PredefinedServiceChargesService } from './predefined-service-charges.service';
import { PredefinedServiceChargesController } from './predefined-service-charges.controller';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
  controllers: [PredefinedServiceChargesController],
  providers: [PredefinedServiceChargesService, PrismaService],
})
export class PredefinedServiceChargesModule {}
