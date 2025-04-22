import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { FlatType } from '@prisma/client';

export class UpdateFlatDto {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsInt()
  society_id?: number;

  @IsOptional()
  @IsInt()
  owner_id?: number;

  @IsOptional()
  @IsEnum(FlatType)
  flat_type?: FlatType;

  @IsOptional()
  @IsInt()
  resident_id?: number; // Used to assign a new resident (handled via FlatResident)
}