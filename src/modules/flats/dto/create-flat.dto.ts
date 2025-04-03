import { IsString, IsInt, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator'; 
import { FlatType } from '@prisma/client';
import { Type } from 'class-transformer';
export class CreateFlatDto {
  @IsString()
  number: string;

  @IsInt()
  society_id: number;

  @IsInt()
  owner_id: number;
  
  @IsInt()
  @IsOptional()
  resident_id?: number;
 
  @IsEnum(FlatType) 
  flat_type: FlatType;
}
 