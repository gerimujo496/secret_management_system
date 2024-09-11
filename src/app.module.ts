import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from './modules/account/account.module';
import { MembershipModule } from './modules/membership/membership.module';

@Module({
  imports: [ConfigModule.forRoot(), AccountModule, MembershipModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
