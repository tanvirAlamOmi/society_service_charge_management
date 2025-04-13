import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitiatePaymentDto } from './dto/create-registration-payment.dto';
import { RegistrationPaymentEntity } from './entities/registration-payment.entity';
import axios from 'axios';
import { randomBytes } from 'crypto';
import { PaymentStatus } from '@prisma/client';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RegistrationPaymentService {
  private readonly logger = new Logger(RegistrationPaymentService.name);
 
  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async initiatePayment(dto: InitiatePaymentDto): Promise<{ payment_url: string; payment_id: number }> {
    const { email, amount, promo_code  } = dto; 
    
    let promo ;
    if (promo_code) {
      promo = await this.prisma.promo.findUnique({
        where: { code: promo_code },
      });
      if (!promo) {
        throw new BadRequestException(`Invalid promo code: ${promo_code}`);
      }
    }else {
      promo = null;
    }
    
    const payment = await this.prisma.registrationPayment.create({
      data: {
        session_id: randomBytes(16).toString('hex'),
        email,
        amount,
        status: PaymentStatus.PENDING,
        promo: promo_code ? { connect: { code: promo_code } } : undefined,
       },
    });

    const storeId = this.configService.get<string>('STORE_ID');
    const storePasswd = this.configService.get<string>('STORE_PASSWORD');
    const paymentGatewayUrl = this.configService.get<string>('PAYMENT_GATEWAY_URL');
    const successUrl = this.configService.get<string>('SUCCESS_URL');
    const failUrl = this.configService.get<string>('FAIL_URL');
    const cancelUrl = this.configService.get<string>('CANCEL_URL');

    if (!paymentGatewayUrl || !storeId || !storePasswd) {
      throw new BadRequestException('Payment gateway configuration missing');
    }

    const payload = {
      store_id: storeId,
      store_passwd: storePasswd,
      total_amount: amount,
      currency: 'BDT',
      tran_id: payment.id.toString(),
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: successUrl, 
      cus_email: email,   
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
          data: { session_id: response.data.sessionkey },
        });
        return { payment_url: response.data.GatewayPageURL, payment_id: payment.id };
      } else {
        await this.prisma.registrationPayment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            transaction_details: { ssl_response: response.data },          
          },
        });
        throw new BadRequestException('Failed to initiate payment');
      }
    } catch (error) {
      this.logger.error(`Payment initiation failed: ${error.message}`);
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

  async handlePaymentCallback(callbackData: any): Promise<{
    status: string;
    message?: string;
    payment?: RegistrationPaymentEntity;
  }> {
    const { tran_id, status, val_id, amount, currency, tran_date, bank_tran_id } = callbackData;

    const payment = await this.prisma.registrationPayment.findUnique({
      where: { id: parseInt(tran_id) },
    });
    if (!payment) {
      this.logger.error(`Payment not found for tran_id: ${tran_id}`);
      throw new BadRequestException('Invalid payment ID');
    }

    try {
      const validationResponse = await axios.get(
        `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${this.configService.get<string>('STORE_ID')}&store_passwd=${ this.configService.get<string>('STORE_PASSWORD')}&format=json`,
      );

      const { status: validationStatus, tran_id: validatedTranId } = validationResponse.data;

      if (validationStatus !== 'VALID' && validationStatus !== 'VALIDATED') {
        const updatedPayment = await this.prisma.registrationPayment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            tran_id: bank_tran_id || validatedTranId || tran_id,
            transaction_details: { 
              callback: callbackData,
              validation: validationResponse.data,
            },
          },
          include: {
            society: { select: { id: true, name: true } },
            user: { select: { id: true, email: true } },
            promo: { select: { id: true, code: true } },
          },
        });

        return {
          status: 'failed',
          message: 'Payment validation failed',
          payment: updatedPayment as RegistrationPaymentEntity,
        };
      }

      if (status === 'VALID' || status === 'VALIDATED') {
        const updatedPayment = await this.prisma.registrationPayment.update({
          where: { id: payment.id },
          data: {
            tran_id: bank_tran_id || validatedTranId,
            status: PaymentStatus.SUCCESS,
            transaction_details: { 
              callback: callbackData,
              validation: validationResponse.data,
            },
          },
          include: {
            society: { select: { id: true, name: true } },
            user: { select: { id: true, email: true } },
            promo: { select: { id: true, code: true } },
          },
        });

        return {
          status: 'success',
          payment: updatedPayment as RegistrationPaymentEntity,
        };
      } else {
        const updatedPayment = await this.prisma.registrationPayment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            tran_id: bank_tran_id || validatedTranId || tran_id,
            transaction_details: { 
              callback: callbackData,
              validation: validationResponse.data,
            },
          },
          include: {
            society: { select: { id: true, name: true } },
            user: { select: { id: true, email: true } },
            promo: { select: { id: true, code: true } },
          },
        });

        return {
          status: 'failed',
          message: 'Payment not validated',
          payment: updatedPayment as RegistrationPaymentEntity,
        };
      }
    } catch (error) {
      this.logger.error(`Callback error: ${error.message}`);
      const updatedPayment = await this.prisma.registrationPayment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          tran_id: bank_tran_id || tran_id,
          transaction_details: { 
            callback: callbackData,
            error: error.message,
          },
        },
        include: {
          society: { select: { id: true, name: true } },
          user: { select: { id: true, email: true } },
          promo: { select: { id: true, code: true } },
        },
      });

      return {
        status: 'failed',
        message: 'Callback processing error',
        payment: updatedPayment as RegistrationPaymentEntity,
      };
    }
  }

  async getPaymentHistory({ email, societyId }: { email?: string; societyId?: number }): Promise<RegistrationPaymentEntity[]> {
    return this.prisma.registrationPayment.findMany({
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
    }) as Promise<RegistrationPaymentEntity[]>;
  }

  async findAll(): Promise<RegistrationPaymentEntity[]> {
    return this.prisma.registrationPayment.findMany();
  }
}