import { Module } from '@nestjs/common';
import { SecretSharingService } from './secret-sharing.service';
import { SecretSharingController } from './secret-sharing.controller';
import { AccountDAL } from '../account/dal/account.dal';
import { PrismaService } from '../prisma/prisma.service';
import { SecretSharingDAL } from './secret-sharing.dal';
import { SecretDAL } from '../secrets/secret.dal';
import { EmailService } from '../email/email.service';
import { SendgridClient } from '../email/sendgrid-client';
import { UserDal } from '../user/user.dal';
import { MembershipDAL } from '../membership/dal/membership.dal';
import { ErrorDal } from '../../common/dal/error.dal';
import { PassportModule } from '../passport/passport.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PassportModule, AuthModule],
  providers: [
    SecretSharingService,
    AccountDAL,
    PrismaService,
    SecretSharingDAL,
    SecretDAL,
    EmailService,
    SendgridClient,
    UserDal,
    MembershipDAL,
    ErrorDal,
  ],
  controllers: [SecretSharingController],
  exports: [AccountDAL, SecretSharingDAL],
})
export class SecretSharingModule {}
