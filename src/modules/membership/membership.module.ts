import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../email/email.module';
import { ConfigModule } from '@nestjs/config';
import { MembershipDAL } from './dal/membership.dal';
import { ErrorDal } from 'src/common/dal/error.dal';

@Module({
  imports: [EmailModule, ConfigModule],
  controllers: [MembershipController],
  providers: [MembershipService, PrismaService, MembershipDAL, ErrorDal],
})
export class MembershipModule {}
