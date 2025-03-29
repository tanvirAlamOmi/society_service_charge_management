// src/users/dto/create-user.dto.ts
import { IsString, IsEmail, IsInt, IsBoolean, IsOptional, IsEnum } from 'class-validator';
 import { UserStatus } from '@prisma/client';

export class CreateUserDto { 
  @IsString()
  @IsOptional()
  username?: string;
 
  @IsString()
  fullname: string;
 
  @IsString()
  @IsOptional()
  alias?: string;
 
  @IsEmail()
  email: string;
 
  @IsString()
  @IsOptional()
  password?: string;
 
  @IsInt()
  role_id: number;
 
  @IsInt()
  society_id: number;
 
  @IsInt()
  @IsOptional()
  flat_id?: number;
 
  @IsString()
  @IsOptional()
  service_type?: string;
 
  @IsBoolean()
  @IsOptional()
  pay_service_charge?: boolean;
 
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}