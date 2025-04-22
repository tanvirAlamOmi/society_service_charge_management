import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    if (!emailUser) {
      throw new Error('EMAIL_USER is not defined in environment variables');
    }
    const emailPass = this.configService.get<string>('EMAIL_PASS');
    if (!emailPass) {
      throw new Error('EMAIL_PASS is not defined in environment variables');
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const from = this.configService.get<string>('MAIL_FROM');
      if (!from) {
        throw new Error('MAIL_FROM is not defined in environment variables');
      }

      await this.mailerService.sendMail({
        from,
        to,
        subject,
        html,
        text: this.htmlToText(html),  
      });

      this.logger.log(`Email sent to ${to}`);
      return { id: `gmail-${Date.now()}` };  
    } catch (error) {
      this.logger.error(`Error sending email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      const from = this.configService.get<string>('MAIL_FROM');
       if (!from) {
        throw new Error('MAIL_FROM is not defined in environment variables');
      }

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Welcome, ${name}!</h1>
            <p style="color: #555;">Thanks for joining our app.</p>
            <a href="https://flatwise.tanapps.com" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #8747e1; text-decoration: none; border-radius: 5px;">Visit App</a>
          </body>
        </html>
      `;

      await this.mailerService.sendMail({
        from,
        to,
        subject: 'Welcome to Our App!',
        html,
        text: this.htmlToText(html),
      });

      this.logger.log(`Welcome email sent to ${to}`);
      return { id: `gmail-${Date.now()}` };
    } catch (error) {
      this.logger.error(`Error sending welcome email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendInvitationEmail(to: string, name: string, token: string) {
    try {
      const from = this.configService.get<string>('MAIL_FROM');
      if (!from) {
        throw new Error('MAIL_FROM is not defined in environment variables');
      }

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const acceptUrl = `${frontendUrl}/accept-invitation?token=${token}`;
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Invitation to Join</title>
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Hello, ${name}!</h1>
            <p style="color: #555;">You've been invited to join our app. Please accept the invitation to complete your registration.</p>
            <a href="${acceptUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #8747e1; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
            <p style="color: #555;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${acceptUrl}" style="color: #007bff;">${acceptUrl}</a></p>
            <p style="color: #555;">This invitation expires in 30 days.</p>
          </body>
        </html>
      `;

      await this.mailerService.sendMail({
        from,
        to,
        subject: 'Invitation to Join Our App',
        html,
        text: this.htmlToText(html),
      });

      this.logger.log(`Invitation email sent to ${to}`);
      return { id: `gmail-${Date.now()}` };
    } catch (error) {
      this.logger.error(`Error sending invitation email to ${to}: ${error.message}`);
      throw error;
    }
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]+>/g, '') 
      .replace(/\s+/g, ' ') 
      .trim();
  }
}