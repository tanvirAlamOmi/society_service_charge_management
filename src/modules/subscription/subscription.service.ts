import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomBytes } from 'crypto';
import { PaymentStatus, SocietyStatus } from '@prisma/client';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionEntity } from './entities/subscription.entity';
import { plainToInstance, instanceToPlain } from 'class-transformer';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateSubscriptionDto, tranId?: string): Promise<SubscriptionEntity> {
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

    if (society_id) {
      const society = await this.prisma.society.findUnique({ where: { id: society_id } });
      if (!society) {
        throw new BadRequestException(`Society with ID ${society_id} not found`);
      }
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        session_id: randomBytes(16).toString('hex'),
        email,
        amount,
        currency: 'BDT',
        status: PaymentStatus.PENDING,
        tran_id: tranId || null,
        society: { connect: { id: society_id } },
        user: user_id ? { connect: { id: user_id } } : undefined,
        promo: promo_code ? { connect: { code: promo_code } } : undefined,
        payment_date: new Date(),
        start_date: new Date(), 
        end_date: new Date(),
      },
      include: {
        society: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
        promo: { select: { id: true, code: true } },
      },
    });

    return plainToInstance(SubscriptionEntity, subscription);
  }

  async initiatePayment(dto: CreateSubscriptionDto): Promise<{ payment_url: string; subscription_id: number }> {
    const subscription = await this.create(dto);

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
      total_amount: subscription.amount ,
      currency: subscription.currency,
      tran_id: subscription.id.toString(),
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: successUrl,
      cus_email: subscription.email,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
    };

    try {
      const response = await axios.post(paymentGatewayUrl, payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status === 'SUCCESS') {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            session_id: response.data.sessionkey,
            tran_id: subscription.id.toString(),
          },
        });
        return { payment_url: response.data.GatewayPageURL, subscription_id: subscription.id };
      } else {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: PaymentStatus.FAILED,
            transaction_details: instanceToPlain(response.data),
          },
        });
        throw new BadRequestException(`Failed to initiate payment: ${response.data.failedreason || 'Unknown error'}`);
      }
    } catch (error) {
      this.logger.error(`Payment initiation failed for subscription ID ${subscription.id}: ${error.message}`);
      await this.prisma.subscription.update({
        where: { id: subscription.id },
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

  async handlePaymentCallback(payload: any): Promise<SubscriptionEntity> {
    const { tran_id, status, val_id, amount, currency, tran_date, bank_tran_id, card_type } = payload;

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: parseInt(tran_id) },
      include: { society: true },
    });

    if (!subscription) {
      this.logger.error(`subscription not found for tran_id: ${tran_id}`);
      throw new BadRequestException('Invalid subscription ID');
    }

    let updatedStatus: PaymentStatus;
    let transactionDetails = instanceToPlain(payload);
    let updateData = {start_date:new Date(), end_date: new Date() };

    try {
      switch (status) {
        case 'VALID':
        case 'VALIDATED':
          const verification = await this.verifyPayment(val_id);
          if (verification.status === 'VALID' || verification.status === 'VALIDATED') {
            updatedStatus = PaymentStatus.SUCCESS;
            const now = new Date();
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + 30);
            updateData.start_date = now;
            updateData.end_date = endDate;
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
      this.logger.error(`Callback error for payment ID ${subscription.id}: ${error.message}`);
      updatedStatus = PaymentStatus.FAILED;
      transactionDetails.error = error.message;
    }
    
    return this.prisma.$transaction(async (prisma) => {
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: updatedStatus,
          tran_id: bank_tran_id || tran_id,
          transaction_details: transactionDetails,
          payment_method: card_type || subscription.payment_method || 'UNKNOWN',
          currency: currency || subscription.currency,
          payment_date: tran_date ? new Date(tran_date) : new Date(),
          start_date: updateData.start_date,
          end_date: updateData.end_date,
        },
        include: {
          society: { select: { id: true, name: true } },
          user: { select: { id: true, email: true } },
          promo: { select: { id: true, code: true } },
        },
      });

      if (status === 'VALID' || status === 'VALIDATED') {
        await this.prisma.society.update({
          where: { id: subscription.society_id },
          data: { status: SocietyStatus.ACTIVE },
        });
      }

      return plainToInstance(SubscriptionEntity, updatedSubscription);
    });
  }

  async getSocietySubscription(societyId: number): Promise<SubscriptionEntity[]> {
    
    if ( !societyId) {
      throw new BadRequestException('SocietyId is required');
    }
    const subscriptions = await this.prisma.subscription.findMany({
      where: { 
        society_id: societyId ,
      },
      include: {
        society: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
        promo: { select: { id: true, code: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return subscriptions.map((payment) => plainToInstance(SubscriptionEntity, payment));
  }

  async findAll(): Promise<SubscriptionEntity[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      include: {
        society: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
        promo: { select: { id: true, code: true } },
      },
    });

    return subscriptions.map((payment) => plainToInstance(SubscriptionEntity, payment));
  }
}