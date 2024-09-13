import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../email/email.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [EmailModule, ConfigModule],
  controllers: [MembershipController],
  providers: [MembershipService, PrismaService],
})
export class MembershipModule {}
