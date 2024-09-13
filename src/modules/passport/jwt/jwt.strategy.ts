import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserDal } from '../../user/user.dal';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userDal: UserDal) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'okencwqc',
    });
  }

  async validate(payload: any) {
    const user = await this.userDal.findByEmail(payload.email);

    if (user) {
      return user;
    }
  }
}
