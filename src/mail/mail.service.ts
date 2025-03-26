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
      secure:false, // this.configService.get<boolean>('EMAIL_SECURE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });
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
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
