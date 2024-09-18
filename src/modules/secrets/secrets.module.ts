import { Module } from '@nestjs/common';

import { SecretsService } from './secrets.service';
import { SecretsController } from './secrets.controller';
import { SecretDAL } from './secret.dal';
import { AccountDAL } from '../account/dal/account.dal';
import { ErrorDal } from '../../common/dal/error.dal';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { PassportModule } from '../passport/passport.module';

@Module({
  imports: [PrismaModule, PassportModule],
  providers: [SecretsService, SecretDAL, AccountDAL, PrismaService, ErrorDal],
  controllers: [SecretsController],
  exports: [SecretDAL, AccountDAL],
})
export class SecretsModule {}
