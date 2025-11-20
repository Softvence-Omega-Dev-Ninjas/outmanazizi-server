import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter<any>;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('APP_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string, text?: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${this.configService.get<string>('EMAIL_FROM') || 'OutManAzizi'}" <${this.configService.get<string>('EMAIL_FROM')}>`,
        to,
        subject,
        html,
        text: text || '',
      });

      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error}`);
    }
  }
}
// constructor(private readonly configService: ConfigService) {
//     const emailUser = this.configService.get<string>('EMAIL_USER');
//     const emailPass = this.configService.get<string>('APP_PASS');

//     if (!emailUser || !emailPass) {
//       throw new Error('Email configuration is missing');
//     }

//     this.transporter = nodemailer.createTransport({
//       host: 'smtp.hostinger.com',
//       port: 465,
//       secure: true,
//       auth: {
//         user: emailUser,
//         pass: emailPass,
//       },
//     });

//     this.transporter.verify((error) => {
//       if (error) {
//         this.logger.error('SMTP connection error:', error);
//       } else {
//         this.logger.log('SMTP server is ready to take messages');
//       }
//     });
//   }