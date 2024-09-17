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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
    }),
    PrismaModule,
    UserModule,
    EmailModule,
    PassportModule,
    AuthModule,
    AccountModule,
    MembershipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
