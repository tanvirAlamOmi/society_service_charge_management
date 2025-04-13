import { IsInt, IsNumber } from 'class-validator';

export class CreateUserServiceChargeDto {
  @IsInt()
  flat_id: number;

  @IsInt()
  predefined_service_charge_id: number;

  @IsNumber()
  amount: number;
}