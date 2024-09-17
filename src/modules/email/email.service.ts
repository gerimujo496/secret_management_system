import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import { SendgridClient } from './sendgrid-client';
import { CreateUserDto } from '../../modules/user/dto/create-user.dto';
import { controller } from '../../constants/controller';
import { controller_path } from '../../constants/controller-path';
import { ConfigService } from '@nestjs/config';
import { CreateSecretsDto } from '../secrets/dtos/create-secrets.dto';

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
  async secretSharingEmail(
    recipient: string,
    secret: CreateSecretsDto,
    secretShareId: number,
  ): Promise<void> {
    const mail: MailDataRequired = {
      to: recipient,
      from: this.configService.get<string>('MAIL_CONFIG_SENDER'),
      templateId: 'd-64f1c5d75abb43159d37b1a747124dbe',
      dynamicTemplateData: {
        secretName: `${secret.name}`,
        description: `${secret.description}`,
        url: `${process.env.HOST}/secret-sharing/${secretShareId}`,
      },
    };
    await this.sendGridClient.send(mail);
  }

  async sendVerificationCodeEmail(
    recipient: string,
    code: number,
  ): Promise<void> {
    const mail: MailDataRequired = {
      to: recipient,
      from: this.configService.get<string>('MAIL_CONFIG_SENDER'),
      subject: 'Your Verification Code',
      text: `Your verification code is ${code}. Please use this code to complete your process.`,
      html: `<p>Your verification code is <strong>${code}</strong>. Please use this code to complete your process.</p>`,
    };
    try {
      await this.sendGridClient.send(mail);
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not send verification code email.',
      );
    }
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
}
