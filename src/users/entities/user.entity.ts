import { User as PrismaUser, UserStatus } from '@prisma/client';

export class UserEntity implements PrismaUser {
  id: number;
  username: string | null;
  fullname: string;
  alias: string | null;
  email: string;
  password: string | null;
  role_id: number;
  society_id: number;
  flat_id: number | null;
  service_type: string | null;
  pay_service_charge: boolean;
  created_at: Date;
  status: UserStatus;  
}