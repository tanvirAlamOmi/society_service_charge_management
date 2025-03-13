import { Payment as PrismaPayment } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class PaymentEntity implements PrismaPayment {
  id: number;
  user_id: number;
  service_charge_id: number;
  amount: Decimal | null;
  status: string;
  payment_month: Date;
  payment_date: Date;
  tran_id: string | null;
  transaction_details: any | null;
}