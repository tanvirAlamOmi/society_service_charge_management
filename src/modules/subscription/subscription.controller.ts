import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, BadRequestException, Redirect } from '@nestjs/common';
import { PricingService } from '../pricing/pricing.service';
import { InitiatePaymentDto } from './dto/create-subscription.dto';
import { SubscriptionEntity } from './entities/subscription.entity';
import { Public } from '../auth/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly registrationPaymentsService: SubscriptionService,
     private readonly configService: ConfigService,

  ) {}
 
  @Public()
  @Post('initiate')
  async initiatePayment(@Body() initiatePaymentDto: InitiatePaymentDto): Promise<{ payment_url: string; subscription_id: number }> {
    return this.registrationPaymentsService.initiatePayment(initiatePaymentDto);
  }

  @Public()
  @Post('success')
  @Redirect()
  async handleSuccess(@Body() payload: any) {
    try {
      const payment = await this.registrationPaymentsService.handlePaymentCallback(payload);
      const frontendSuccessUrl = this.configService.get<string>('FRONTEND_REGISTRATION_SUCCESS_URL');
      if (!frontendSuccessUrl) {
        throw new BadRequestException('Frontend success URL not configured');
      }
      const redirectUrl = `${frontendSuccessUrl}?tran_id=${payment.tran_id}&status=${payment.status}&payment_id=${payment.id}`;
      console.log('Redirecting to:', redirectUrl);
      return {
        url: redirectUrl,
        statusCode: 302,
      };
    } catch (error) {
      const frontendFailUrl = this.configService.get<string>('FRONTEND_REGISTRATION_FAIL_URL');
      const redirectUrl = `${frontendFailUrl}?error=${encodeURIComponent(error.message)}`;
      console.log('Error redirecting to:', redirectUrl);
      return {
        url: redirectUrl,
        statusCode: 302,
      };
    }
  }

  @Public()
  @Post('failed')
  @Redirect()
  async handleFailed(@Body() payload: any) {
    try {
      const payment = await this.registrationPaymentsService.handlePaymentCallback(payload);
      const frontendFailUrl = this.configService.get<string>('FRONTEND_REGISTRATION_FAIL_URL');
      if (!frontendFailUrl) {
        throw new BadRequestException('Frontend fail URL not configured');
      }
      const redirectUrl = `${frontendFailUrl}?tran_id=${payment.tran_id}&status=${payment.status}&payment_id=${payment.id}`;
      console.log('Redirecting to:', redirectUrl);
      return {
        url: redirectUrl,
        statusCode: 302,
      };
    } catch (error) {
      const frontendFailUrl = this.configService.get<string>('FRONTEND_REGISTRATION_FAIL_URL');
      const redirectUrl = `${frontendFailUrl}?error=${encodeURIComponent(error.message)}`;
      console.log('Error redirecting to:', redirectUrl);
      return {
        url: redirectUrl,
        statusCode: 302,
      };
    }
  }

  @Public()
  @Post('cancelled')
  @Redirect()
  async handleCancelled(@Body() payload: any) {
    try {
      const payment = await this.registrationPaymentsService.handlePaymentCallback(payload);
      const frontendCancelUrl = this.configService.get<string>('FRONTEND_REGISTRATION_CANCEL_URL');
      if (!frontendCancelUrl) {
        throw new BadRequestException('Frontend cancel URL not configured');
      }
      const redirectUrl = `${frontendCancelUrl}?tran_id=${payment.tran_id}&status=${payment.status}&payment_id=${payment.id}`;
      console.log('Redirecting to:', redirectUrl);
      return {
        url: redirectUrl,
        statusCode: 302,
      };
    } catch (error) {
      const frontendCancelUrl = this.configService.get<string>('FRONTEND_REGISTRATION_CANCEL_URL');
      const redirectUrl = `${frontendCancelUrl}?error=${encodeURIComponent(error.message)}`;
      console.log('Error redirecting to:', redirectUrl);
      return {
        url: redirectUrl,
        statusCode: 302,
      };
    }
  }


  
  @Get()
  findAll(): Promise<SubscriptionEntity[]> {
    return this.registrationPaymentsService.findAll();
  }
  
  @Get('society/:societyId')
  async getSocietySubscription( 
    @Param('societyId', ParseIntPipe) societyId: number,
  ): Promise<SubscriptionEntity[]> {
    return this.registrationPaymentsService.getSocietySubscription(  societyId );
  }
}
