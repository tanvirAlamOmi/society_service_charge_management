import { Society as PrismaSociety } from '@prisma/client';

export class SocietyEntity implements PrismaSociety {
  id: number;
  name: string;
  owners: number;
  flats: number;
  created_at: Date;
}