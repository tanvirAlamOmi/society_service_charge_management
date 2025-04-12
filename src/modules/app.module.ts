import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SocietiesModule } from './societies/societies.module';
import { PredefinedServiceChargesModule } from './predefined-service-charges/predefined-service-charges.module';
import { ServiceChargesModule } from './service-charges/service-charges.module';
import { UserServiceChargesModule } from './user-service-charges/user-service-charges.module';
import { FlatsModule } from './flats/flats.module';
import { PaymentsModule } from './payments/payments.module';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    // UsersModule, 
    // SocietiesModule, 
    // PredefinedServiceChargesModule, 
    // ServiceChargesModule, 
    // UserServiceChargesModule,
    // FlatsModule, 
    // PaymentsModule, 
    // RolesModule, 
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    // CustomLoggerService, 
    // AllExceptionsFilter,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,  
    // }, 
  ],
})
export class AppModule {}
