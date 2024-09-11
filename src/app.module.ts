import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

import { SecretsService } from './modules/secrets/secrets.service';
import { SecretsController } from './modules/secrets/secrets.controller';
import { SecretsModule } from './modules/secrets/secrets.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, SecretsModule],
  controllers: [AppController, SecretsController],
  providers: [AppService, SecretsService],
})
export class AppModule {}
