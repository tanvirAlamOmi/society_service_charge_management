import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { BillModule } from '../bill/bill.module';

@Module({
  imports: [ConfigModule, BillModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService],
})
export class PaymentsModule {}
