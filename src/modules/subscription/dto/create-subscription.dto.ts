import { IsArray, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FlatType, PaymentStatus } from '@prisma/client';

export class FlatInfoDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsEnum(FlatType)
  flat_type: FlatType;
}

export class BuildingInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @IsNumber()
  @IsOptional()
  location_lat?: number;

  @IsNumber()
  @IsOptional()
  location_lng?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlatInfoDto)
  @IsNotEmpty()
  flats: FlatInfoDto[];

  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  user_emails: string[];
} 

export class InitiatePaymentDto {
  @IsEmail()
  email: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  promo_code?: string;

  @ValidateNested()
  @Type(() => BuildingInfoDto)
  building_info: BuildingInfoDto;
}

export class CreateSubscriptionDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsOptional()
  @IsString({ message: 'Promo code must be a string' })
  promo_code?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Society ID must be a number' })
  society_id?: number;

  @IsOptional()
  @IsNumber({}, { message: 'User ID must be a number' })
  user_id?: number;
}