 import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SocietyStatus, UserStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { addMinutes } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        society: true,
      },
    });
  
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is not active. Please complete your profile or contact the admin.');
    }
  
    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    // Check if user is part of a society
    if (!user.society_id) {
      throw new UnauthorizedException('You are not part of any society. Please wait for an invitation.');
    }
  
    // Check society subscription status 
    if ( user.society?.status === SocietyStatus.PAYMENT_DUE
       || user.society?.status === SocietyStatus.INACTIVE) {
      throw new UnauthorizedException( 'Society subscription is not active. Please settle the payment due to continue using the service.' );
    }
  
    const { password: hashedPassword, ...result } = user;
    return { ...result  };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { email: user.email, sub: user.id, role: user.role_id, society_id: user.society_id.id };    
    return {
      access_token: this.jwtService.sign(payload),
      user: user
    };
  }

   async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Generate a 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = addMinutes(new Date(), 30);

    // Store the reset token
    await this.prisma.passwordResetToken.create({
      data: {
        code: resetCode,
        userId: user.id,
        expiresAt,
      },
    });

    // Send reset code via email
    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.fullname,
      resetCode,
    );

    return { message: 'Password reset code sent to your email' };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        code,
        expiresAt: { gte: new Date() },
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    // Mark the token as used
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Generate a temporary JWT for password reset
    const payload = { email: user.email, sub: user.id, type: 'password_reset' };
    const resetTokenJwt = this.jwtService.sign(payload, { expiresIn: '15m' });

    return { resetToken: resetTokenJwt };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    if (!resetToken || !newPassword) {
      throw new BadRequestException('Reset token and new password are required');
    }

    let payload;
    try {
      payload = this.jwtService.verify(resetToken);
      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Invalidate all reset tokens for this user
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    return { message: 'Password reset successfully' };
  }
}