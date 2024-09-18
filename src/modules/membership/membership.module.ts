import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../email/email.module';
import { MembershipDAL } from './dal/membership.dal';
import { ErrorDal } from '../../common/dal/error.dal';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [EmailModule, ConfigModule, UserModule, AuthModule],
  controllers: [MembershipController],
  providers: [MembershipService, PrismaService, MembershipDAL, ErrorDal],
})
export class MembershipModule {}
