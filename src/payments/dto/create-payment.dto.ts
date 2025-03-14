// src/payments/dto/create-payment.dto.ts
import { IsInt, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  user_id: number;

  @IsInt()
  service_charge_id: number;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  status: string;

  @IsDateString()
  payment_month: string; 

  tran_id: string | null;

  transaction_details: any | null;
}