import { Module } from '@nestjs/common';
import { RegistrationPaymentService } from './registration-payment.service';
import { RegistrationPaymentController } from './registration-payment.controller';
import { PricingService } from '../pricing/pricing.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RegistrationPaymentController],
  providers: [RegistrationPaymentService, PricingService, PrismaService],
})
export class RegistrationPaymentModule {}
