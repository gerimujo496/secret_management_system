
import { Module } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { SecretsController } from './secrets.controller';
import { SecretsDAL } from './secrets.dal'; 
import { PrismaService } from 'src/prisma/prisma.service'; 

@Module({
  imports: [],
  providers: [SecretsService, SecretsDAL, PrismaService],
  controllers: [SecretsController],
  exports:[SecretsDAL]
})
export class SecretsModule {}
