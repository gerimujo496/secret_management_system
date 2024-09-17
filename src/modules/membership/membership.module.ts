import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MembershipDAL } from './dal/membership.dal';
import { ErrorDal } from 'src/common/dal/error.dal';
import { UserModule } from '../user/user.module';
import { UserDal } from '../user/user.dal';

@Module({
  imports: [EmailModule, ConfigModule, UserModule],
  controllers: [MembershipController],
  providers: [MembershipService, PrismaService, MembershipDAL, ErrorDal],
})
export class MembershipModule {}
