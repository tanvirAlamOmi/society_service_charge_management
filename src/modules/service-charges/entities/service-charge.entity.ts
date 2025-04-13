import { ServiceCharge as PrismaServiceCharge, FlatType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class ServiceChargeEntity implements PrismaServiceCharge {
  id: number;
  society_id: number;
  predefined_service_charge_id: number;
  flat_type: FlatType;
  amount: Decimal;
  created_at: Date;
  updated_at: Date;
}