import { IsString, IsInt } from 'class-validator';

export class CreateFlatDto {
  @IsString()
  number: string;

  @IsInt()
  society_id: number;

  @IsInt()
  owner_id: number;
}