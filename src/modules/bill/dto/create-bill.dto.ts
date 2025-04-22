import { IsInt, IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';
import { BillStatus, PaymentStatus } from '@prisma/client';

export class GenerateBillsDto {
  @IsInt()
  societyId: number;

  @IsDateString()
  month: string; 
}

export class AssignBillDto {
  @IsInt()
  ownerId: number;

  @IsInt()
  residentId: number;
}

export class PayBillDto {
  @IsInt()
  userId: number;

  @IsNumber()
  amount: number;

  @IsString()
  payment_method: string;

  @IsString()
  @IsOptional()
  tran_id?: string;
}

export class ChargeDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;
}

export class BillResponseDto {
  @IsInt()
  id: number;

  @IsInt()
  user_id: number;

  @IsInt()
  flat_id: number;

  @IsInt()
  society_id: number;

  @IsDateString()
  bill_month: string;

  @IsEnum(BillStatus)
  status: BillStatus;

  @IsNumber()
  total_amount: number;

  @IsArray()
  common_charges: ChargeDto[];

  @IsArray()
  flat_charges: ChargeDto[];

  flat: {
    number: string;
    flat_type: string;
  };

  society: {
    name: string;
  };

  payments: {
    id: number;
    amount: number;
    status: PaymentStatus;
    payment_date: string;
    tran_id?: string | null;
  }[];
}

export class PayBillResponseDto {
  bill: BillResponseDto;
  payment: {
    id: number;
    amount: number;
    status: PaymentStatus;
    payment_date: string;
    tran_id?: string | null;
  };
}