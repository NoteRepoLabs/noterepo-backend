import { Injectable } from '@nestjs/common';
import { generateVerifyLink } from '../utils/generateLinks/generateVerifyLink';
import Handlebars from 'handlebars';
import { join } from 'path';
import { promises as fs } from 'fs';
import * as nodemailer from 'nodemailer';

@Injectable()
export class emailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
      ignoreTLS: true,
    });
  }

  private async readAndCompileTemplate(file: string, data: any) {
    const htmlFilePath = join(__dirname, `templates//${file}`);

    const htmlFileContent = await fs.readFile(htmlFilePath, {
      encoding: 'utf-8',
    });

    const htmlTemplate = Handlebars.compile(htmlFileContent);

    const html = htmlTemplate(data);

    return html;
  }

  //private async createNodemailerConnection() { }

  private async sendEmail(
    email: string,
    html: any,
    subject: string,
    text?: string,
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: `Noterepo <${process.env.NOTEREPO_MAIL}>`,
        to: email,
        subject,
        text,
        html,
      });
      console.log('Mail sent successfully!');
      console.log(
        `[MailResponse]=${info.response} [MessageID]=${info.messageId}`,
      );
    } catch (error) {
      console.error(`An error occurred while sending mail: ${error.message}`);
    }
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
