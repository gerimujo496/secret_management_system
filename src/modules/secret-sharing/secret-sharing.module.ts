import { Module } from '@nestjs/common';
import { SecretSharingService } from './secret-sharing.service';
import { SecretSharingController } from './secret-sharing.controller';
import { AccountDAL } from '../account/account.dal';
import { PrismaService } from '../prisma/prisma.service';
import { SecretSharingDAL } from './secret-sharing.dal';
import { SecretsDAL } from '../secrets/secrets.dal';
import { EmailService } from '../email/email.service';
import { SendgridClient } from '../email/sendgrid-client';
import { UserDal } from '../user/user.dal';
import { MembershipDAL } from '../membership/membership.dal';

@Module({
  providers: [
    SecretSharingService,
    AccountDAL,
    PrismaService,
    SecretSharingDAL,
    SecretsDAL,
   EmailService,
   SendgridClient,
   UserDal,
   MembershipDAL
  ],
  controllers: [SecretSharingController],
  exports: [AccountDAL, SecretSharingDAL],
})
export class SecretSharingModule {}
