import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDal } from '../../user/user.dal';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userDal: UserDal,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('TOKEN_SECRET_KEY'),
    });
  }

  async validate(payload: any) {
    const user = await this.userDal.findByEmail(payload.email);

    if (user) {
      if (
        user.isTwoFactorAuthenticationEnabled &&
        !payload.isTwoFactorAuthenticated
      )
        throw new UnauthorizedException();
      return user;
    }
  }
}
