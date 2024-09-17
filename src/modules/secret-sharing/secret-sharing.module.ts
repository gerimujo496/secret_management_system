import { Module } from '@nestjs/common';
import { SecretSharingService } from './secret-sharing.service';
import { SecretSharingController } from './secret-sharing.controller';
import { AccountDAL } from '../account/dal/account.dal';
import { PrismaService } from '../prisma/prisma.service';
import { SecretSharingDAL } from './secret-sharing.dal';
import { ErrorDal } from 'src/common/dal/error.dal';

@Module({
  providers: [SecretSharingService,AccountDAL,PrismaService,SecretSharingDAL,ErrorDal],
  controllers: [SecretSharingController],
  exports:[AccountDAL,SecretSharingDAL]
})
export class SecretSharingModule {}
