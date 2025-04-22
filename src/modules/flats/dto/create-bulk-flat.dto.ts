import { IsInt, IsArray, ValidateNested, IsString, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFlatDto } from './create-flat.dto';
import { FlatType } from '@prisma/client';
 
export class BulkCreateFlatsDto {
  @IsInt()
  society_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFlatForBulkDto)
  flats: CreateFlatForBulkDto[];
}

export class CreateFlatForBulkDto {
    @IsString()
    number: string;
  
    @IsInt()
    owner_id: number;
 
    @IsEnum(FlatType)
    flat_type: FlatType;
  }