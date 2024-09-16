import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { EmailModule } from './modules/email/email.module';
import { PrismaModule } from './modules/prisma/prisma.module';
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
    AccountModule,
    MembershipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
