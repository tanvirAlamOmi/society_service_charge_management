// src/payments/dto/create-payment.dto.ts
import { IsInt, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @IsInt()
  user_id: number;

  @IsInt()
  flat_id: number;

  @IsInt()
  society_id: number;

  @IsInt()
  service_charge_id: number;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  status: PaymentStatus;

  @IsDateString()
  payment_month: string; 

  tran_id: string | null;

  transaction_details: any | null;

  currency: string;

}