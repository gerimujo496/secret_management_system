import { Module } from '@nestjs/common';
import { SecretSharingService } from './secret-sharing.service';
import { SecretSharingController } from './secret-sharing.controller';
import { AccountDAL } from '../account/account.dal';
import { PrismaService } from 'src/prisma/prisma.service';
import { SecretSharingDAL } from './secret-sharing.dal';

@Module({
  providers: [
    SecretSharingService,
    AccountDAL,
    PrismaService,
    SecretSharingDAL,
  ],
  controllers: [SecretSharingController],
  exports: [AccountDAL, SecretSharingDAL],
})
export class SecretSharingModule {}
