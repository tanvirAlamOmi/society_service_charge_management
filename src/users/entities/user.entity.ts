import { User as PrismaUser } from '@prisma/client';

export class UserEntity implements PrismaUser {
  id: number;
  username: string;
  fullname: string;
  alias: string;
  email: string;
  password: string; // Note: In practice, avoid exposing this in responses
  role_id: number;
  society_id: number;
  flat_id: number | null;
  service_type: string | null;
  pay_service_charge: boolean;
  created_at: Date;
}