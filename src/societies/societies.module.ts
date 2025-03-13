import { Module } from '@nestjs/common';
import { SocietiesService } from './societies.service';
import { SocietiesController } from './societies.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SocietiesController],
  providers: [SocietiesService, PrismaService],
})
export class SocietiesModule {}
