import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsInt()
  role_id: number;

  @IsInt()
  society_id: number;

  @IsOptional()
  @IsInt()
  flat_id?: number;

  @IsOptional()
  @IsString()
  service_type?: string;

  @IsOptional()
  @IsBoolean()
  pay_service_charge?: boolean;
}
