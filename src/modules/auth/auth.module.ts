import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthHelper } from './auth.helper';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { PassportModule } from '../passport/passport.module';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthHelper],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('TOKEN_SECRET_KEY'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
    forwardRef(() => EmailModule),
    forwardRef(() => UserModule),
    forwardRef(() => PassportModule),
    forwardRef(() => PrismaModule),
  ],
  exports: [AuthService],
})
export class AuthModule {}
