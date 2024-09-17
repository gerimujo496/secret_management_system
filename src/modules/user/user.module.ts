import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserDal } from './user.dal';
import { EmailModule } from '../email/email.module';
import { PassportModule } from '../../modules/passport/passport.module';
import { ErrorDal } from '../../common/dal/error.dal';

@Module({
  controllers: [UserController],
  providers: [UserService, UserDal, ErrorDal],
  imports: [PrismaModule, EmailModule, forwardRef(() => PassportModule)],
  exports: [UserDal, UserService],
})
export class UserModule {}
