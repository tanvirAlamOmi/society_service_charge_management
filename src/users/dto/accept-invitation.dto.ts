import { IsString, IsOptional, Matches } from 'class-validator'; 

export class AcceptInvitationDto { 
  @IsString()
  username: string;
 
  @IsString()
  password: string;
 
  @IsString()
  @IsOptional()
  alias?: string;
 
  @Matches(/^(?:\+88|88)?(01[3-9]\d{8})$/, {
    message: 'Phone number must be a valid Bangladeshi number (e.g., +8801XXXXXXXXX or 01XXXXXXXXX)',
  })
  phone?: string;

  @IsString()
  @IsOptional()
  service_type?: string;
}