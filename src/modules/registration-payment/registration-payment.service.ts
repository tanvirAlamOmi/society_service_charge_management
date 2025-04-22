import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomBytes } from 'crypto';
import { PaymentStatus } from '@prisma/client';
import { CreateRegistrationPaymentDto } from './dto/create-registration-payment.dto';
import { RegistrationPaymentEntity } from './entities/registration-payment.entity';
import { plainToInstance, instanceToPlain } from 'class-transformer';

@Injectable()
export class RegistrationPaymentService {
  private readonly logger = new Logger(RegistrationPaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateRegistrationPaymentDto, tranId?: string): Promise<RegistrationPaymentEntity> {
    const { email, amount, promo_code, society_id, user_id } = dto;

    // Validate promo code if provided
    if (promo_code) {
      const promo = await this.prisma.promo.findUnique({
        where: { code: promo_code },
      });
      if (!promo) {
        throw new BadRequestException(`Invalid promo code: ${promo_code}`);
      }
    }

    const payment = await this.prisma.registrationPayment.create({
      data: {
        session_id: randomBytes(16).toString('hex'),
        email,
        amount,
        currency: 'BDT',
        status: PaymentStatus.PENDING,
        tran_id: tranId || null,
        society: society_id ? { connect: { id: society_id } } : undefined,
        user: user_id ? { connect: { id: user_id } } : undefined,
        promo: promo_code ? { connect: { code: promo_code } } : undefined,
      },
      include: {
        society: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
        promo: { select: { id: true, code: true } },
      },
    });

    return plainToInstance(RegistrationPaymentEntity, payment);
  }

  async initiatePayment(dto: CreateRegistrationPaymentDto): Promise<{ payment_url: string; payment_id: number }> {
    const payment = await this.create(dto);

    const storeId = this.configService.get<string>('STORE_ID');
    const storePasswd = this.configService.get<string>('STORE_PASSWORD');
    const paymentGatewayUrl = this.configService.get<string>('PAYMENT_GATEWAY_URL');
    const successUrl = this.configService.get<string>('REGISTRATION_SUCCESS_URL');
    const failUrl = this.configService.get<string>('REGISTRATION_FAIL_URL');
    const cancelUrl = this.configService.get<string>('REGISTRATION_CANCEL_URL');

    if (!paymentGatewayUrl || !storeId || !storePasswd || !successUrl || !failUrl || !cancelUrl) {
      throw new BadRequestException('Payment gateway configuration missing');
    }

    const payload = {
      store_id: storeId,
      store_passwd: storePasswd,
      total_amount: payment.amount ,
      currency: payment.currency,
      tran_id: payment.id.toString(),
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: successUrl,
      cus_email: payment.email,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
    };

    try {
      const response = await axios.post(paymentGatewayUrl, payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status === 'SUCCESS') {
        await this.prisma.registrationPayment.update({
          where: { id: payment.id },
          data: {
            session_id: response.data.sessionkey,
            tran_id: payment.id.toString(),
          },
        });
        return { payment_url: response.data.GatewayPageURL, payment_id: payment.id };
      } else {
        await this.prisma.registrationPayment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            transaction_details: instanceToPlain(response.data),
          },
        });
        throw new BadRequestException(`Failed to initiate payment: ${response.data.failedreason || 'Unknown error'}`);
      }
    } catch (error) {
      this.logger.error(`Payment initiation failed for payment ID ${payment.id}: ${error.message}`);
      await this.prisma.registrationPayment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          transaction_details: { error: error.message },
        },
      });
      throw new BadRequestException('Payment initiation error');
    }
  }

  async verifyPayment(valId: string): Promise<any> {
    const storeId = this.configService.get<string>('STORE_ID');
    const storePasswd = this.configService.get<string>('STORE_PASSWORD');
    const validationUrl = this.configService.get<string>('VALIDATION_URL');

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
      return instanceToPlain(response.data);
    } catch (error) {
      this.logger.error(`Payment verification failed for val_id ${valId}: ${error.message}`);
      throw new BadRequestException(`Payment verification failed: ${error.message}`);
    }
  }

  async handlePaymentCallback(payload: any): Promise<RegistrationPaymentEntity> {
    const { tran_id, status, val_id, amount, currency, tran_date, bank_tran_id, card_type } = payload;

    const payment = await this.prisma.registrationPayment.findUnique({
      where: { id: parseInt(tran_id) },
    });

    if (!payment) {
      this.logger.error(`Payment not found for tran_id: ${tran_id}`);
      throw new BadRequestException('Invalid payment ID');
    }

    let updatedStatus: PaymentStatus;
    let transactionDetails = instanceToPlain(payload);

    try {
      switch (status) {
        case 'VALID':
        case 'VALIDATED':
          const verification = await this.verifyPayment(val_id);
          if (verification.status === 'VALID' || verification.status === 'VALIDATED') {
            updatedStatus = PaymentStatus.SUCCESS;
          } else {
            updatedStatus = PaymentStatus.FAILED;
            transactionDetails.error = 'Payment validation failed';
          }
          transactionDetails.validation = instanceToPlain(verification);
          break;
        case 'FAILED':
          updatedStatus = PaymentStatus.FAILED;
          break;
        case 'CANCELED':
          updatedStatus = PaymentStatus.CANCELLED;
          break;
        default:
          updatedStatus = PaymentStatus.PENDING;
          transactionDetails.error = `Unknown payment status: ${status}`;
      }
    } catch (error) {
      this.logger.error(`Callback error for payment ID ${payment.id}: ${error.message}`);
      updatedStatus = PaymentStatus.FAILED;
      transactionDetails.error = error.message;
    }

    const updatedPayment = await this.prisma.registrationPayment.update({
      where: { id: payment.id },
      data: {
        status: updatedStatus,
        tran_id: bank_tran_id || tran_id,
        transaction_details: transactionDetails,
        payment_method: card_type || payment.payment_method || 'UNKNOWN',
        currency: currency || payment.currency,
        payment_date: tran_date ? new Date(tran_date) : new Date(),
      },
      include: {
        society: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
        promo: { select: { id: true, code: true } },
      },
    });

    return plainToInstance(RegistrationPaymentEntity, updatedPayment);
  }

  async getPaymentHistory({ email, societyId }: { email?: string; societyId?: number }): Promise<RegistrationPaymentEntity[]> {
    const payments = await this.prisma.registrationPayment.findMany({
      where: {
        email: email ? email : undefined,
        society_id: societyId ? societyId : undefined,
      },
      include: {
        society: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
        promo: { select: { id: true, code: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return payments.map((payment) => plainToInstance(RegistrationPaymentEntity, payment));
  }

  async findAll(): Promise<RegistrationPaymentEntity[]> {
    const payments = await this.prisma.registrationPayment.findMany({
      include: {
        society: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
        promo: { select: { id: true, code: true } },
      },
    });

    return payments.map((payment) => plainToInstance(RegistrationPaymentEntity, payment));
  }
}