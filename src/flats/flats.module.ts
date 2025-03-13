import { Module } from '@nestjs/common';
import { FlatsService } from './flats.service';
import { FlatsController } from './flats.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FlatsController],
  providers: [FlatsService, PrismaService],
})
export class FlatsModule {}
