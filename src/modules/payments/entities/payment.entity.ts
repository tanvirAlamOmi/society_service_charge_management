import { Payment as PrismaPayment, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class PaymentEntity implements PrismaPayment {
  id: number;
  user_id: number;
  flat_id: number;
  bill_id: number;
  society_id: number; 
  amount: Decimal | null;
  status: PaymentStatus;
  payment_month: Date;
  payment_date: Date;
  tran_id: string | null;
  transaction_details: any | null;
  currency: string;
  payment_method: string | null;
}