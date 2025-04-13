import { UserServiceCharge as PrismaUserServiceCharge } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class UserServiceChargeEntity implements PrismaUserServiceCharge {
  id: number;
  flat_id: number;
  predefined_service_charge_id: number;
  amount: Decimal;  //may change based on flat size, 2bhk,3bhk,4bhk etc
  created_at: Date;
  updated_at: Date;
}