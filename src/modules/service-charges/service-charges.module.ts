import { Module } from '@nestjs/common';
import { ServiceChargesService } from './service-charges.service';
import { ServiceChargesController } from './service-charges.controller';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
  controllers: [ServiceChargesController],
  providers: [ServiceChargesService, PrismaService],
})
export class ServiceChargesModule {}
