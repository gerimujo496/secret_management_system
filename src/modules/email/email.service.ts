import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import { SendgridClient } from './sendgrid-client';
import { CreateUserDto } from '../../modules/user/dto/create-user.dto';
import { controller } from 'src/constants/controller';
import { controller_path } from 'src/constants/controllerPath';

@Injectable()
export class EmailService {
  constructor(private readonly sendGridClient: SendgridClient) {}

  async sendTestEmail(
    recipient: string,
    body = 'This is a test mail',
  ): Promise<void> {
    const mail: MailDataRequired = {
      to: recipient,
      from: 'geri.mujo@softup.co',
      subject: 'Test email',
      content: [{ type: 'text/plain', value: body }],
    };
    await this.sendGridClient.send(mail);
  }

  async sendConfirmationEmail(
    recipient: string,
    user: CreateUserDto,
  ): Promise<void> {
    const mail: MailDataRequired = {
      to: recipient,

      from: 'geri.mujo@softup.co',
      templateId: 'd-c5ead45ced5745f196cbc2cc354d438a',
      dynamicTemplateData: {
        userName: `${user.firstName} ${user.lastName}`,
        url: `${process.env.HOST}/${controller.AUTH}/${controller_path.AUTH.CONFIRM_EMAIL}?token=${user.confirmationToken}`,
      },
    };
    await this.sendGridClient.send(mail);
  }
}
