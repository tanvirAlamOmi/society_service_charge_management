import { Bill as PrismaBill, BillStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class BillEntity implements PrismaBill {
  id: number;
  user_id: number;
  flat_id: number;
  society_id: number;
  bill_month: Date;
  common_charges: any;  
  flat_charges: any; 
  total_amount: Decimal;
  status: BillStatus;
  created_at: Date;
  updated_at: Date;
}