import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, UserModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
