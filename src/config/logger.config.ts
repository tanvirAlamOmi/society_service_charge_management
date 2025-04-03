import * as winston from 'winston';

export const loggerConfig = {
  level: 'error', 
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),  
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log', 
      maxsize: 5242880,  
      maxFiles: 5, 
    }),
    new winston.transports.Console(),   
  ],
};