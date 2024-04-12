import { Injectable } from '@nestjs/common';
import { generateVerifyLink } from 'src/utils/generateLinks/generateVerifyLink';
import Handlebars from 'handlebars';
import { join } from 'path';
import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { promises as fs } from 'fs';

@Injectable()
export class EmailService {
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
    const mailgun = new Mailgun(FormData);

    const key =
      process.env.NODE_ENV === 'development'
        ? process.env.TEST_MAILGUN_API_KEY
        : process.env.MAILGUN_API_KEY;

    const mg = mailgun.client({
      username: 'api',
      key,
    });

    const domain =
      process.env.NODE_ENV === 'development'
        ? process.env.TEST_MAIL_DOMAIN
        : process.env.MAIL_DOMAIN;

    //Create and send messages with mailgun api
    mg.messages
      .create(domain, {
        from: `Noterepo <${process.env.NOTEREPO_MAIL}>`,
        to: email,
        subject,
        text,
        html,
      })
      .then((msg) => {
        console.log('Mail sent successfully');

        console.log(msg);
      })
      .catch((err) => {
        console.log('There was an error while sending mail');

        console.error(err);
      });
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
