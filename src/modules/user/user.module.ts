import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserDal } from './user.dal';
import { EmailModule } from '../email/email.module';
import { AuthHelper } from './auth.helper';
import { PassportModule } from '../../modules/passport/passport.module';

@Module({
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, UserDal, AuthHelper],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('TOKEN_SECRET_KEY'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
    PrismaModule,
    EmailModule,
    forwardRef(() => PassportModule),
  ],
  exports: [AuthService, UserDal],
})
export class UserModule {}
