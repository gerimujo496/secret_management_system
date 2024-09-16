import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipDAL } from './dal/membership.dal';
import { ErrorDal } from 'src/common/dal/error.dal';

@Module({
  controllers: [MembershipController],
  providers: [MembershipService, PrismaService, MembershipDAL, ErrorDal],
})
export class MembershipModule {}
