import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { SendgridClient } from './sendGrid-client';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, SendgridClient],
  exports: [EmailService],
})
export class EmailModule {}
