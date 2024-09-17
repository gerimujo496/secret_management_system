import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipDAL } from './dal/membership.dal';
import { ErrorDal } from '../../common/dal/error.dal';
import { PassportModule } from '../passport/passport.module';

@Module({
  imports: [PassportModule],
  controllers: [MembershipController],
  providers: [MembershipService, PrismaService, MembershipDAL, ErrorDal],
})
export class MembershipModule {}
