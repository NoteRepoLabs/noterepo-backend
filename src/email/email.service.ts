import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationLink(email: string, link: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Noterepo verification link',
      template: './verify',
      context: {
        link,
      },
    });
  }
}
