import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
export class LoginDto { 
  email: string;
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class VerifyResetCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}