import { Module, forwardRef } from '@nestjs/common';
import { PassportService } from './passport.service';
import { PassportController } from './passport.controller';
import { UserModule } from '../../modules/user/user.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [PassportController],
  providers: [PassportService, LocalStrategy, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class PassportModule {}
