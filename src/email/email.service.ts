import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { generateVerifyLink } from '../utils/generateLinks/generateVerifyLink';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) { }

  async sendVerificationLink(email: string, verificationId: string) {
    //Get verification link
    const link = generateVerifyLink(verificationId);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Noterepo verification link',
      template: './verify',
      context: { link },
    });
  }
}
