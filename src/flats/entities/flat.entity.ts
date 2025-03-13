import { Flat as PrismaFlat } from '@prisma/client';

export class FlatEntity implements PrismaFlat {
  id: number;
  number: string;
  society_id: number;
  owner_id: number;
  created_at: Date;
}