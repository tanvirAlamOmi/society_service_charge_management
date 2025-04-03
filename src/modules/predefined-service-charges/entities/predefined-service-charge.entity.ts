import { PredefinedServiceCharge as PrismaPredefinedServiceCharge } from '@prisma/client';

export class PredefinedServiceChargeEntity implements PrismaPredefinedServiceCharge {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
}