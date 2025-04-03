import { IsInt, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { FlatType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateServiceChargeDto {
  @IsInt()
  society_id: number;

  @IsInt()
  predefined_service_charge_id: number;

  @IsEnum(FlatType)
  flat_type: FlatType;

  @IsNumber()
  amount: number;
}

class ServiceChargeAmount {
  @IsEnum(FlatType)
  flat_type: FlatType;

  @IsNumber()
  amount: number;
}

class BulkServiceCharge {
  @IsInt()
  predefined_service_charge_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceChargeAmount)
  amounts: ServiceChargeAmount[];
}

export class CreateBulkServiceChargeDto {
  @IsInt()
  society_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkServiceCharge)
  service_charges: BulkServiceCharge[];
}