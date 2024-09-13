import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendgridClient } from './sendGrid-client';
import { MailDataRequired } from '@sendgrid/mail';
// import { url } from 'inspector';

@Injectable()
export class EmailService {
  constructor(
    private readonly sendGridClient: SendgridClient,
    private configService: ConfigService,
  ) {}

  async sendInvitationForAccountMembership({
    recipient,
    sender,
    url,
  }: EmailInterface): Promise<void> {
    const mail: MailDataRequired = {
      to: recipient,
      from: this.configService.get<string>('MAIL_CONFIG_SENDER'),
      templateId: this.configService.get<string>('INVITATION_EMAIL_TEMPLATE'),
      dynamicTemplateData: {
        name: `${sender.firstName} ${sender.lastName}`,
        url,
      },
    };
    await this.sendGridClient.send(mail);
  }
}
