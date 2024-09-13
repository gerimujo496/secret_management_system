import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

import { SecretsService } from './modules/secrets/secrets.service';
import { SecretsController } from './modules/secrets/secrets.controller';
import { SecretsModule } from './modules/secrets/secrets.module';
import { SecretSharingModule } from './modules/secret-sharing/secret-sharing.module';




@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, SecretsModule, SecretSharingModule],
  controllers: [AppController, SecretsController],
  providers: [AppService, SecretsService],
})
export class AppModule {}
