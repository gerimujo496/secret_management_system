import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountDal } from './account.dal';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AccountController],
  providers: [AccountService, PrismaService, AccountDal],
})
export class AccountModule {}
