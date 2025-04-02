// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  
  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false, // optional, avoid cert issues
      },
    });
  }
  async sendTesting(to:any, from:any, subject:any, text:any){
    const res = await this.transporter.sendMail({
      from,
      to,
      subject,
      text,
    });
    console.log('Email sent:', res.response)

  }
  async sendMail({
    to,
    subject,
    template,
    context,
  }: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }): Promise<void> {
    try {
      // Read the template file
      const templatePath = path.join(
        process.cwd(),
        'src/mail/templates',
        `${template}.hbs`,
      );
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      
      // Compile the template
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate(context);
      
      // Send the email
      const res = await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        html,
      });
      console.log('Email sent:', res.response)
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
