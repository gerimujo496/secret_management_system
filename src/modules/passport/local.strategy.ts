import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LogInUserDto } from '../auth/dto/login-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.returnUserWithoutPsw({
      email,
      password,
    } as LogInUserDto);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
