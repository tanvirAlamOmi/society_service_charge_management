import { IsString, IsInt } from 'class-validator';

export class CreateSocietyDto {
  @IsString()
  name: string;

  @IsInt()
  owners: number;

  @IsInt()
  flats: number;
}