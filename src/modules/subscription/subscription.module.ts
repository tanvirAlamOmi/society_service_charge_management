import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PricingService } from '../pricing/pricing.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionController } from './subscription.controller';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PricingService, PrismaService],
})
export class SubscriptionModule {}
