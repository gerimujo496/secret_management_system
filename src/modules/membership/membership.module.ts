import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MembershipController],
  providers: [MembershipService, PrismaService],
})
export class MembershipModule {}
