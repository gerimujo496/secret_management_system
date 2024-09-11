
import { Module } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { SecretsController } from './secrets.controller';
import { SecretsDAL } from './secrets.dal'; 
import { PrismaService } from 'src/prisma/prisma.service'; 
import { AccountDAL } from '../account/account.dal';

@Module({
  imports: [],
  providers: [SecretsService, SecretsDAL,AccountDAL, PrismaService],
  controllers: [SecretsController],
  exports:[SecretsDAL,AccountDAL]
})
export class SecretsModule {}
