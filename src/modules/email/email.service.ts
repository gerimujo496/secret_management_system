import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import { SendgridClient } from './sendgrid-client';
import { CreateUserDto } from '../../modules/user/dto/create-user.dto';
import { controller } from '../../constants/controller';
import { controller_path } from '../../constants/controller-path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly sendGridClient: SendgridClient,
    private configService: ConfigService,
  ) {}

  async sendConfirmationEmail(
    recipient: string,
    user: CreateUserDto,
  ): Promise<void> {
    const mail: MailDataRequired = {
      to: recipient,
      from: this.configService.get<string>('MAIL_CONFIG_SENDER'),
      templateId: 'd-c5ead45ced5745f196cbc2cc354d438a',
      dynamicTemplateData: {
        userName: `${user.firstName} ${user.lastName}`,
        url: `${process.env.HOST}/${controller.AUTH}/${controller_path.AUTH.CONFIRM_EMAIL}?token=${user.confirmationToken}`,
      },
    };
    await this.sendGridClient.send(mail);
  }

  async sendResetPasswordEmail(
    recipient: string,
    user: CreateUserDto,
  ): Promise<void> {
    const mail: MailDataRequired = {
      to: recipient,
      from: 'geri.mujo@softup.co',
      templateId: 'd-49867ab4ea354ec5ae340808be40427f',
      dynamicTemplateData: {
        userName: `${user.firstName} ${user.lastName}`,
        url: `${process.env.HOST}/${controller.AUTH}/${controller_path.AUTH.RESET_PASSWORD_FORM}?token=${user.confirmationToken}`,
      },
    };
    await this.sendGridClient.send(mail);
  }

  async sendInvitationForAccountMembership({
    recipient,
    sender,
    confirmationToken,
    membershipId,
  }: EmailInterface): Promise<void> {
    const restOrUrl = confirmationToken
      ? `${controller_path.MEMBERSHIP.CONFIRM}?membershipId=${membershipId}&token=${confirmationToken}`
      : `${controller_path.MEMBERSHIP.REGISTER_AND_CONFIRM}?email=${recipient}&membershipId=${membershipId}`;

    const mail: MailDataRequired = {
      to: recipient,
      from: this.configService.get<string>('MAIL_CONFIG_SENDER'),
      templateId: this.configService.get<string>('INVITATION_EMAIL_TEMPLATE'),
      dynamicTemplateData: {
        name: `${sender.firstName} ${sender.lastName}`,
        url: `${process.env.HOST}/${controller_path.MEMBERSHIP.PATH}/${restOrUrl}`,
      },
    };
    await this.sendGridClient.send(mail);
  }
}
