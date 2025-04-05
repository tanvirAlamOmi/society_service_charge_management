// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Options } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
  
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Options('login')
  handleOptions() {
    return; // The cors middleware will add the necessary headers
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
   async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}