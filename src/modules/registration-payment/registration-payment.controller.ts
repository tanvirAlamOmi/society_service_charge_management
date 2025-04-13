import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, BadRequestException } from '@nestjs/common';
import { RegistrationPaymentService } from './registration-payment.service'; 
import { PricingService } from '../pricing/pricing.service';
import { InitiatePaymentDto } from './dto/create-registration-payment.dto';
import { RegistrationPaymentEntity } from './entities/registration-payment.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('registration-payments')
export class RegistrationPaymentController {
  constructor(
    private readonly registrationPaymentsService: RegistrationPaymentService,
    private readonly pricingService: PricingService,
  ) {}
 
  @Public()
  @Post('initiate')
  async initiatePayment(@Body() initiatePaymentDto: InitiatePaymentDto): Promise<{ payment_url: string; payment_id: number }> {
    return this.registrationPaymentsService.initiatePayment(initiatePaymentDto);
  }

  @Public()
  @Post('callback')
  async handleCallback(@Body() callbackData: any): Promise<{
    status: string;
    message?: string;
    payment?: RegistrationPaymentEntity;
  }> {
    return this.registrationPaymentsService.handlePaymentCallback(callbackData);
  }

  @Get('history')
  async getPaymentHistory(
    @Query('email') email: string,
    @Query('societyId', ParseIntPipe) societyId?: number,
  ): Promise<RegistrationPaymentEntity[]> {
    if (!email && !societyId) {
      throw new BadRequestException('Either email or societyId is required');
    }
    return this.registrationPaymentsService.getPaymentHistory({ email, societyId });
  }
  
  @Get()
  findAll(): Promise<RegistrationPaymentEntity[]> {
    return this.registrationPaymentsService.findAll();
  }
  
}
