import { Role as PrismaRole } from '@prisma/client';

export class RoleEntity implements PrismaRole {
  id: number;
  name: string;
  description: string | null;
}