// src/payments/payments.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentEntity } from './entities/payment.entity';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, tranId?: string): Promise<PaymentEntity> {
    return this.prisma.payment.create({
      data: {
        user_id: createPaymentDto.user_id,
        service_charge_id: createPaymentDto.service_charge_id,
        amount: createPaymentDto.amount ?? null,
        status: createPaymentDto.status,
        payment_month: new Date(createPaymentDto.payment_month),
        payment_date: new Date(),
        tran_id: tranId || null,
      },
    });
  }

  async initiatePayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    const { user_id, service_charge_id, amount, payment_month } = createPaymentDto;

    const user = await this.prisma.user.findUnique({ where: { id: user_id } });
    if (!user) throw new BadRequestException(`User with ID ${user_id} not found`);
    const serviceCharge = await this.prisma.serviceCharge.findUnique({ where: { id: service_charge_id } });
    if (!serviceCharge) throw new BadRequestException(`Service Charge with ID ${service_charge_id} not found`);

    const storeId = this.configService.get<string>('STORE_ID');
    const storePasswd = this.configService.get<string>('STORE_PASSWORD');
    const paymentGatewayUrl = this.configService.get<string>('PAYMENT_GATEWAY_URL');
    const successUrl = this.configService.get<string>('SUCCESS_URL');
    const failUrl = this.configService.get<string>('FAIL_URL');
    const cancelUrl = this.configService.get<string>('CANCEL_URL');

    if (!paymentGatewayUrl || !storeId || !storePasswd) {
      throw new BadRequestException('Payment gateway configuration missing');
    }

    const tranId = `TXN-${Date.now()}`;

    const payload = {
      store_id: storeId,
      store_passwd: storePasswd,
      total_amount: amount || serviceCharge.amount.toNumber(),
      currency: 'BDT',
      tran_id: tranId,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      cus_name: user.fullname,
      cus_email: user.email,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000',
    };

    try {
      const response = await axios.post(paymentGatewayUrl, payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status === 'SUCCESS') {
        const payment = await this.create({ ...createPaymentDto, status: 'pending' }, tranId);
        return { payment, gatewayResponse: response.data };
      } else {
        throw new BadRequestException('Failed to initiate payment: ' + response.data.failedreason);
      }
    } catch (error) {
      throw new BadRequestException('Payment initiation failed: ' + error.message);
    }
  }

  async findAll(): Promise<PaymentEntity[]> {
    return this.prisma.payment.findMany();
  }

  async findOne(id: number): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);
    return payment;
  }

  async updateByTranId(tranId: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.findUnique({ where: { tran_id: tranId } });
    if (!payment) throw new NotFoundException(`Payment with transaction ID ${tranId} not found`);
    return this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        ...updatePaymentDto,
        payment_month: updatePaymentDto.payment_month ? new Date(updatePaymentDto.payment_month) : undefined,
      },
    });
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);
    return this.prisma.payment.update({
      where: { id },
      data: {
        ...updatePaymentDto,
        payment_month: updatePaymentDto.payment_month ? new Date(updatePaymentDto.payment_month) : undefined,
      },
    });
  }

  async remove(id: number): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);
    return this.prisma.payment.delete({ where: { id } });
  }
}