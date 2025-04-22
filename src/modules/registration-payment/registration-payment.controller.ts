import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, BadRequestException, Redirect } from '@nestjs/common';
import { RegistrationPaymentService } from './registration-payment.service'; 
import { PricingService } from '../pricing/pricing.service';
import { InitiatePaymentDto } from './dto/create-registration-payment.dto';
import { RegistrationPaymentEntity } from './entities/registration-payment.entity';
import { Public } from '../auth/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('registration-payments')
export class RegistrationPaymentController {
  constructor(
    private readonly registrationPaymentsService: RegistrationPaymentService,
     private readonly configService: ConfigService,

  ) {}
 
  @Public()
  @Post('initiate')
  async initiatePayment(@Body() initiatePaymentDto: InitiatePaymentDto): Promise<{ payment_url: string; payment_id: number }> {
    return this.registrationPaymentsService.initiatePayment(initiatePaymentDto);
  }

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
