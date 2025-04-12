 import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

     if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is not active. Please complete your profile or contact the admin.');
    }

     if (!user.password || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

     const { password: hashedPassword, ...result } = user; // Rename destructured password to hashedPassword
    return result;
  }

  async login(email: string, password: string) {
    return true;
    const user = await this.validateUser(email, password);
    const payload = { email: user.email, sub: user.id, role: user.role_id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

   async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}