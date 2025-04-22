import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, BadRequestException, Redirect } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentEntity> {
    return this.paymentsService.create(createPaymentDto);
  }

  @Post('initiate')
  initiatePayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.initiatePayment(createPaymentDto);
  }

  // @Post('success')
  // async handleSuccess(@Body() body: any) {
  //   console.log('Payment Success:', body);
  //   if (body.status === 'VALID') {
  //     const payment = await this.paymentsService.updateByTranId(body.tran_id, {
  //       status: PaymentStatus.SUCCESS,
  //       transaction_details: body,
  //     });
  //     return { message: 'Payment successful', payment };
  //   }
  //   return { message: 'Payment success callback received', data: body };
  // }

  // @Post('fail')
  // async handleFail(@Body() body: any) {
  //   console.log('Payment Failed:', body);
  //   if (body.status === 'FAILED') {
  //     const payment = await this.paymentsService.updateByTranId(body.tran_id, {
  //       status: PaymentStatus.FAILED,
  //       transaction_details: body,
  //     });
  //     return { message: 'Payment failed', payment };
  //   }
  //   return { message: 'Payment failure callback received', data: body };
  // }

  // @Post('cancel')
  // async handleCancel(@Body() body: any) {
  //   console.log('Payment Cancelled:', body);
  //   if (body.status === 'CANCELLED') {
  //     const payment = await this.paymentsService.updateByTranId(body.tran_id, {
  //       status: PaymentStatus.CANCELLED,
  //       transaction_details: body,
  //     });
  //     return { message: 'Payment cancelled', payment };
  //   }
  //   return { message: 'Payment cancellation callback received', data: body };
  // }

  @Post('success')
  @Redirect()
  async handleSuccess(@Body() payload: any) {
    try {
      const payment = await this.paymentsService.handlePaymentCallback(payload);
      const frontendSuccessUrl = this.configService.get<string>('FRONTEND_SUCCESS_URL');
      if (!frontendSuccessUrl) {
        throw new BadRequestException('Frontend success URL not configured');
      }
      const redirectUrl = `${frontendSuccessUrl}?tran_id=${payment.tran_id}&status=${payment.status}&payment_id=${payment.id}`;
      console.log('Redirecting to:', redirectUrl); // Debug log
      return {
        url: redirectUrl,
        statusCode: 302,
      };
    } catch (error) {
      const frontendFailUrl = this.configService.get<string>('FRONTEND_FAIL_URL');
      const redirectUrl = `${frontendFailUrl}?error=${encodeURIComponent(error.message)}`;
      console.log('Error redirecting to:', redirectUrl); // Debug log
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
      const payment = await this.paymentsService.handlePaymentCallback(payload);
      const frontendFailUrl = this.configService.get<string>('FRONTEND_FAIL_URL');
      if (!frontendFailUrl) {
        throw new BadRequestException('Frontend fail URL not configured');
      }
      const redirectUrl = `${frontendFailUrl}?tran_id=${payment.tran_id}&status=${payment.status}&payment_id=${payment.id}`;
      return {
        url: redirectUrl,
        statusCode: 302,
      };
    } catch (error) {
      const frontendFailUrl = this.configService.get<string>('FRONTEND_FAIL_URL');
      const redirectUrl = `${frontendFailUrl}?error=${encodeURIComponent(error.message)}`;
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
      const payment = await this.paymentsService.handlePaymentCallback(payload);
      const frontendCancelUrl = this.configService.get<string>('FRONTEND_CANCEL_URL');
      if (!frontendCancelUrl) {
        throw new BadRequestException('Frontend cancel URL not configured');
      }
      const redirectUrl = `${frontendCancelUrl}?tran_id=${payment.tran_id}&status=${payment.status}&payment_id=${payment.id}`;
       return {
        url: redirectUrl,
        statusCode: 302,
      };
    } catch (error) {
      const frontendCancelUrl = this.configService.get<string>('FRONTEND_CANCEL_URL');
      const redirectUrl = `${frontendCancelUrl}?error=${encodeURIComponent(error.message)}`;
       return {
        url: redirectUrl,
        statusCode: 302,
      };
    }
  }

  @Get()
  findAll(): Promise<PaymentEntity[]> {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PaymentEntity> {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentEntity> {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<PaymentEntity> {
    return this.paymentsService.remove(id);
  }

  @Get('society/:societyId')
  findPaymentsBySocietyId(
    @Param('societyId', ParseIntPipe) societyId: number,
  ): Promise<PaymentEntity[]> {
    return this.paymentsService.findPaymentsBySocietyId(societyId);
  }
  
  @Get('society/:societyId/user/:userId')
  findPaymentsByUserId(
    @Param('societyId', ParseIntPipe) societyId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<PaymentEntity[]> {
    return this.paymentsService.findPaymentsByUserId(userId, societyId);
  }
}