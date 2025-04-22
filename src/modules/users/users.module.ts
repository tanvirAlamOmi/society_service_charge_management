import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';  
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [AuthModule, MailModule], 
  controllers: [UsersController],
  providers: [UsersService, PrismaService ],
})
export class UsersModule {}
