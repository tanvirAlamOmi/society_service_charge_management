import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentEntity } from './entities/payment.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentEntity> {
    return this.paymentsService.create(createPaymentDto);
  }

  @Post('initiate')
  initiatePayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.initiatePayment(createPaymentDto);
  }

  @Post('success')
  async handleSuccess(@Body() body: any) {
    console.log('Payment Success:', body);
    if (body.status === 'VALID') {
      const payment = await this.paymentsService.updateByTranId(body.tran_id, {
        status: 'completed',
        transaction_details: body,
      });
      return { message: 'Payment successful', payment };
    }
    return { message: 'Payment success callback received', data: body };
  }

  @Post('fail')
  async handleFail(@Body() body: any) {
    console.log('Payment Failed:', body);
    if (body.status === 'FAILED') {
      const payment = await this.paymentsService.updateByTranId(body.tran_id, {
        status: 'failed',
        transaction_details: body,
      });
      return { message: 'Payment failed', payment };
    }
    return { message: 'Payment failure callback received', data: body };
  }

  @Post('cancel')
  async handleCancel(@Body() body: any) {
    console.log('Payment Cancelled:', body);
    if (body.status === 'CANCELLED') {
      const payment = await this.paymentsService.updateByTranId(body.tran_id, {
        status: 'cancelled',
        transaction_details: body,
      });
      return { message: 'Payment cancelled', payment };
    }
    return { message: 'Payment cancellation callback received', data: body };
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
}