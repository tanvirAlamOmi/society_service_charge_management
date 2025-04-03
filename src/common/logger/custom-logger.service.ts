import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { loggerConfig } from '../../config/logger.config';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger(loggerConfig);
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ message, trace, context });
  }

  warn(message: string) {
    this.logger.warn(message);
  }
}