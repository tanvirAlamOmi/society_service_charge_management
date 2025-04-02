 
import { IsString, IsOptional, IsInt } from 'class-validator'; 

export class CreateSocietyDto { 
  @IsString()
  name: string;
 
  @IsString()
  @IsOptional()
  address?: string;
 
  @IsString()
  @IsOptional()
  postal_code?: string;
 
  @IsString()
  @IsOptional()
  city?: string;
 
  @IsString()
  @IsOptional()
  state?: string;
 
  @IsString()
  @IsOptional()
  country?: string;

  @IsInt()
  total_flats: number
}