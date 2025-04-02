// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
 
    const secretOrKey = configService.get<string>('JWT_SECRET');
    if (!secretOrKey) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Define the options with proper typing
    const options: StrategyOptionsWithoutRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey, 
    };

    super(options);
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload); // Log the payload

    if (!payload.sub) {
      console.log('No sub field in payload');
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    console.log('User from database:', user);  

    if (!user) {
      console.log('User not found for id:', payload.sub);
      throw new UnauthorizedException('Invalid or inactive user');
    }

    if (user.status !== UserStatus.ACTIVE) {
      console.log('User status is not ACTIVE:', user.status);
      throw new UnauthorizedException('Invalid or inactive user');
    }

    return { id: user.id, email: user.email, role: user.role_id, society: user.society_id };
  }
}