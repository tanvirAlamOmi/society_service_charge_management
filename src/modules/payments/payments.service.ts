import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentEntity } from './entities/payment.entity';
import axios from 'axios';
import { PaymentStatus } from '@prisma/client';
import { BillService } from '../bill/bill.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private readonly billService: BillService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, tranId?: string): Promise<PaymentEntity> {
    return this.prisma.payment.create({
      data: {
        user: { connect: { id: createPaymentDto.user_id } },
        flat:   {  connect: { id: createPaymentDto.flat_id } },    
        society: { connect: { id: createPaymentDto.society_id } },
        bill: {  connect: { id: createPaymentDto.bill_id } },
        amount: createPaymentDto.amount ?? null,
        status: createPaymentDto.status,
        payment_month: new Date(createPaymentDto.payment_month),
        payment_date: new Date(),
        tran_id: tranId || null,
      },
    });
  }

  async initiatePayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    const { user_id, flat_id, society_id, amount, payment_month, bill_id } = createPaymentDto;
   
    if (!amount || amount <= 0) {
      throw new BadRequestException('Payment amount is required and must be greater than 0');
    }
    
    const user = await this.prisma.user.findUnique({ where: { id: user_id } });
    if (!user) throw new BadRequestException(`User with ID ${user_id} not found`);
    
    const bill = await this.prisma.bill.findUnique({ where: { id: bill_id } });
    if (!bill) throw new BadRequestException(`Bill with ID ${bill_id} not found`);
    if (bill.status === 'PAID') throw new BadRequestException(`Bill with ID ${bill_id} is already paid`);
    
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
      total_amount: amount,
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
    };

    try {
      const response = await axios.post(paymentGatewayUrl, payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status === 'SUCCESS') {         
        const payment = await this.create({ ...createPaymentDto, status: PaymentStatus.PENDING }, tranId);
        
        const paymentUrl = response.data.GatewayPageURL;  

         return {
          payment_url: paymentUrl,
          payment_id: payment.id,
        };
      } else {
        throw new BadRequestException('Failed to initiate payment: ' + response.data.failedreason);
      }
    } catch (error) {
      throw new BadRequestException('Payment initiation failed: ' + error.message);
    }
  }

  async verifyPayment(valId: string): Promise<any> {
    const storeId = this.configService.get<string>('STORE_ID');
    const storePasswd = this.configService.get<string>('STORE_PASSWORD');
    const validationUrl = this.configService.get<string>('VALIDATION_URL'); // Add to .env, e.g., https://securepay.sslcommerz.com/validator/api/validationserverAPI.php

    if (!validationUrl || !storeId || !storePasswd) {
      throw new BadRequestException('Payment verification configuration missing');
    }

    try {
      const response = await axios.get(validationUrl, {
        params: {
          val_id: valId,
          store_id: storeId,
          store_passwd: storePasswd,
          format: 'json',
        },
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException('Payment verification failed: ' + error.message);
    }
  }

  async handlePaymentCallback(payload: any): Promise<any> {     
    const { tran_id, status, val_id, amount, currency, card_type } = payload;

    const payment = await this.prisma.payment.findUnique({
      where: { tran_id },
    });

    if (!payment) {
      console.log('Payment with transaction ID ${tran_id} not found at handlePaymentCallback');
      
      throw new BadRequestException(`Payment with transaction ID ${tran_id} not found`);
    }

    let updatedStatus: PaymentStatus;
    let transactionDetails = payload;

    switch (status) {
      case 'VALID':
      case 'VALIDATED':
        updatedStatus = PaymentStatus.SUCCESS;
        const verification = await this.verifyPayment(val_id);
        if (verification.status !== 'VALID' && verification.status !== 'VALIDATED') {
          throw new BadRequestException('Payment verification failed');
        }
        transactionDetails = verification;  
        break;
      case 'FAILED':
        updatedStatus = PaymentStatus.FAILED;
        break;
      case 'CANCELED':
        updatedStatus = PaymentStatus.CANCELLED;
        break;
      default:
        updatedStatus = PaymentStatus.PENDING;
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { tran_id },
      data: {
        status: updatedStatus,
        transaction_details: transactionDetails,  
        payment_method: card_type || 'UNKNOWN', 
        amount: parseFloat(amount) || payment.amount,
        currency: currency || 'BDT',
      },
    });
    
    if (updatedPayment.bill_id) {
      await this.billService.updateBillStatusFromPayment({
        bill_id: updatedPayment.bill_id,
        status: updatedStatus,
        amount: updatedPayment.amount ? updatedPayment.amount.toNumber() : 0, 
      });
    }

    return updatedPayment;
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

  async findPaymentsByUserId(userId: number, societyId: number): Promise<PaymentEntity[]> {
    // Validate user existence
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }
  
    // Validate society existence
    const society = await this.prisma.society.findUnique({ where: { id: societyId } });
    if (!society) {
      throw new BadRequestException(`Society with ID ${societyId} not found`);
    }
  
    // Fetch payments filtered by both user_id and society_id
    return this.prisma.payment.findMany({
      where: {
        user_id: userId,
        society_id: societyId,
      },
      
    });
  }

  async findPaymentsBySocietyId(societyId: number): Promise<PaymentEntity[]> {
    const society = await this.prisma.society.findUnique({ where: { id: societyId } });
    if (!society) {
      throw new BadRequestException(`Society with ID ${societyId} not found`);
    }

    return this.prisma.payment.findMany({
      where: {
        society_id: societyId,
      } 
    });
  }
}