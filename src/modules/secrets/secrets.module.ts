
import { Module } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { SecretsController } from './secrets.controller';
import { SecretsDAL } from './secrets.dal'; 

import { AccountDAL } from '../account/dal/account.dal';
import { ErrorDal } from 'src/common/dal/error.dal';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [SecretsService, SecretsDAL,AccountDAL, PrismaService,ErrorDal],
  controllers: [SecretsController],
  exports:[SecretsDAL,AccountDAL]
})
export class SecretsModule {}
