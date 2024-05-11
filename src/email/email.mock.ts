import { Injectable } from '@nestjs/common';
import { generateVerifyLink } from '../utils/generateLinks/generateVerifyLink';
import Handlebars from 'handlebars';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class emailService {
  private async readAndCompileTemplate(file: string, data: any) {
    const htmlFilePath = join(__dirname, `templates//${file}`);

    const htmlFileContent = await fs.readFile(htmlFilePath, {
      encoding: 'utf-8',
    });

    const htmlTemplate = Handlebars.compile(htmlFileContent);

    const html = htmlTemplate(data);

    return html;
  }

  private async sendEmail(
    email: string,
    html: any,
    subject: string,
    text?: string,
  ) {
    return {
      from: `Noterepo <${process.env.NOTEREPO_MAIL}>`,
      email,
      subject,
      text,
      html,
    };
  }

  async sendVerificationMail(email: string, verificationId: string) {
    //Get verification link
    const link = await generateVerifyLink(verificationId);

    //compile templates
    const creds = {
      link: link,
    };

    //Read and compile the template
    const html = await this.readAndCompileTemplate('verify.html', creds);

    await this.sendEmail(
      email,
      html,
      'Noterepo account verification',
      undefined,
    );
  }

  async sendResetPasswordMail(email: string, link: string) {
    const creds = {
      resetLink: link,
    };

    const html = await this.readAndCompileTemplate('resetPassword.html', creds);

    await this.sendEmail(
      email,
      html,
      'Noterepo reset password mail',
      undefined,
    );
  }
}
