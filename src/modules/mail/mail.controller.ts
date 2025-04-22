import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('send')
  async sendEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('html') html: string,
  ) {
    await this.mailService.sendMail(to, subject, html);
    return { message: 'Email sent successfully' };
  }

  @Post('welcome')
  async sendWelcomeEmail(
    @Body('to') to: string,
    @Body('name') name: string,
  ) {
    await this.mailService.sendWelcomeEmail(to, name);
    return { message: 'Welcome email sent successfully' };
  }
}