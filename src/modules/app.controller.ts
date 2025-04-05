import { Controller, Get, Options } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Options('*')
  handleOptions() {
    return; // The cors middleware will add the necessary headers
  }
  
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
