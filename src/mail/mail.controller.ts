import { Controller, Get, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { from } from 'rxjs';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test')
  async sendTestEmail(   
  ) {
    try {
      await this.mailService.sendTesting(
        'test-01rusknh6@srv1.mail-tester.com',
        'tipsadvisors@tipservices.ca',
               'Test Email',
         'This is a test email from the application.',
      );
      console.log('Test email sent successfully');
      return {
        success: true,
        message: 'Test email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send test email',
        error: error.message,
      };
    }
  }
}
