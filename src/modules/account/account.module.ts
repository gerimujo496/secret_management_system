import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccountDAL } from './dal/account.dal';
import { ErrorDal } from '../../common/dal/error.dal';

@Module({
  controllers: [AccountController],
  providers: [AccountService, PrismaService, AccountDAL, ErrorDal],
})
export class AccountModule {}
