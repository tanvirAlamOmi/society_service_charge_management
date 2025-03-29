import { IsString, IsOptional } from 'class-validator'; 

export class AcceptInvitationDto { 
  @IsString()
  username: string;
 
  @IsString()
  password: string;
 
  @IsString()
  @IsOptional()
  alias?: string;
 
  @IsString()
  @IsOptional()
  service_type?: string;
}