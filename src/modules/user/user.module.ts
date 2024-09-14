import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserDal } from './user.dal';
import { EmailModule } from '../email/email.module';
import { AuthHelper } from '../auth/auth.helper';
import { PassportModule } from '../../modules/passport/passport.module';

@Module({
  controllers: [UserController],
  providers: [UserService, UserDal],
  imports: [PrismaModule, EmailModule, forwardRef(() => PassportModule)],
  exports: [UserDal, UserService],
})
export class UserModule {}
