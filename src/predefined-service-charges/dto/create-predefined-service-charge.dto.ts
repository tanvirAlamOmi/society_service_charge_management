import { IsString, IsOptional } from 'class-validator';

export class CreatePredefinedServiceChargeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}