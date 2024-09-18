import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../../modules/user/user.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => UserModule)],
  controllers: [],
  providers: [LocalStrategy, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class PassportModule {}
