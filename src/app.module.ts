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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    UsersModule, 
    SocietiesModule, 
    PredefinedServiceChargesModule, 
    ServiceChargesModule, 
    UserServiceChargesModule,
    FlatsModule, 
    PaymentsModule, RolesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
