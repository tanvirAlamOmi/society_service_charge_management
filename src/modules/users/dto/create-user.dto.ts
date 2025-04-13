 import { IsString, IsEmail, IsInt, IsBoolean, IsOptional, IsEnum, Matches, IsArray, ValidateNested, IsNotEmpty  } from 'class-validator';
 import { UserStatus } from '@prisma/client';
 import { Type } from 'class-transformer';
 
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

  @IsOptional() 
  @Matches(/^(?:\+88|88)?(01[3-9]\d{8})$/, {
    message: 'Phone number must be a valid Bangladeshi number (e.g., +8801XXXXXXXXX or 01XXXXXXXXX)',
  })
  phone?: string;
 
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

export class BulkInviteUsersDto {
  @IsInt({ message: 'Society ID must be an integer' })
  @IsNotEmpty({ message: 'Society ID is required' })
  society_id: number;

  @IsArray({ message: 'Users must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  @IsNotEmpty({ message: 'Users array cannot be empty' })
  users: CreateUserDto[];
}