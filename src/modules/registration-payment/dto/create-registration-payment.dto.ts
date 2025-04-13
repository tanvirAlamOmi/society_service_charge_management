import { IsArray, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FlatType } from '@prisma/client';

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