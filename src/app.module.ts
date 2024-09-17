import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { EmailModule } from './modules/email/email.module';
import { PassportModule } from './modules/passport/passport.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import { MembershipModule } from './modules/membership/membership.module';

import { SecretsService } from './modules/secrets/secrets.service';
import { SecretsController } from './modules/secrets/secrets.controller';
import { SecretsModule } from './modules/secrets/secrets.module';
import { SecretSharingModule } from './modules/secret-sharing/secret-sharing.module';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
    }),
    PrismaModule,
    SecretsModule,
    SecretSharingModule,
    UserModule,
    EmailModule,
    PassportModule,
    AuthModule,
    AccountModule,
    MembershipModule,
    SecretsModule, SecretSharingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
