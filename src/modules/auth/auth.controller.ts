// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Options } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
  
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Options('login') // Handle OPTIONS requests for /auth/login
  handleOptions() {
    return; // Simply return an empty response with 204 status
  }
  
  @Public()
  @Post('login')
  // @HttpCode(HttpStatus.OK)
   async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}