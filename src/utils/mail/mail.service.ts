import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { ApiResponse } from '../common/apiresponse/apiresponse';

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

  async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${this.configService.get<string>('EMAIL_FROM') || 'OutManzizi'}" <${this.configService.get<string>('EMAIL_FROM')}>`,
        to,
        subject,
        html,
        text: text || '',
      });

      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }
}
