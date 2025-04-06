import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as cors from 'cors';
import logger from './common/logger/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); 

  // app.use(
  //   cors({
  //     origin: 'https://rnfwb-27-147-204-249.a.free.pinggy.link', // Reflects the request origin
  //     methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'] ,
  //     allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  //     credentials: false,
  //     preflightContinue: false, // Ensure the cors middleware handles OPTIONS requests
  //   }),
  // );
  
  app.enableCors({
    origin: 'https://flatwise.tanapps.com/login',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: false,
  });
  // const allExceptionsFilter = app.get(AllExceptionsFilter);
  // app.useGlobalFilters(allExceptionsFilter);
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     skipMissingProperties: true,
  //     skipUndefinedProperties: true,
  //     skipNullProperties: true,
  //     transform: true,
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     // Skip validation for OPTIONS requests
  //     transformOptions: {
  //       enableImplicitConversion: true,
  //     },
  //   }),
  // );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
