import { Flat as PrismaFlat, FlatType } from '@prisma/client';

export class FlatEntity implements PrismaFlat {
  id: number;
  number: string;
  society_id: number;
  owner_id: number;
  resident_id: number | null;
  flat_type: FlatType;
  created_at: Date;
  updated_at: Date;
}