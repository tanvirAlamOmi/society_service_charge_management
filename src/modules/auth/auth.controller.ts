import { Controller, Post, Body, HttpCode, HttpStatus, Options } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, ResetPasswordDto, VerifyResetCodeDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
  
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {} 
  
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
   async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  async verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(verifyResetCodeDto.email, verifyResetCodeDto.code);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.resetToken, resetPasswordDto.newPassword);
  }
}