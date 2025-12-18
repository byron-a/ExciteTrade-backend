import nodemailer, { Transporter } from 'nodemailer';

import { HttpException } from '@/exceptions/HttpException';
import { NODEMAILER_EMAIL, NODEMAILER_PASS } from '@config';

class EmailService {
  private user = NODEMAILER_EMAIL;
  private pass = NODEMAILER_PASS;

  private transport: Transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    tls: {
      ciphers: 'SSLv3',
    },
    auth: {
      user: this.user,
      pass: this.pass,
    },
  });

  public async sendEmail({
    to,
    subject,
    body,
  }: {
    to: string;
    subject: string;
    body: string;
  }) {
    try {
      await this.transport.verify();
      this.transport.sendMail({
        to,
        subject,
        html: body,
        from: `ExciteTrade <${this.user}>`,
      });
    } catch (err) {
      throw new HttpException(400, 'Error sending mail');
    }
  }
}

export default EmailService;
