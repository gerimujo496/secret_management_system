import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import { default as SendGridProduction } from '@sendgrid/mail';

@Injectable()
export class SendgridClient {
  private logger: Logger;

  constructor(private configService: ConfigService) {
    this.logger = new Logger(SendgridClient.name);

    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');

    process.env.NODE_ENV == 'dev'
      ? SendGrid.setApiKey(apiKey)
      : SendGridProduction.setApiKey(apiKey);
  }

  async send(mail: MailDataRequired): Promise<void> {
    try {
      await SendGrid.send(mail);
      this.logger.log(`Email successfully dispatched to ${mail.to as string}`);
    } catch (error) {
      this.logger.error('Error while sending email', error);
      throw error;
    }
  }
}
