import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

import { EmailService } from '../email/email.service';
import { UserDal } from './user.dal';
import { CreateUserDto } from './dto/create-user.dto';
import { errorMessage } from '../../constants/error-messages';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthHelper {
  constructor(
    private jwtService: JwtService,
    private emailService: EmailService,
    private usersDal: UserDal,
  ) {}

  async generateToken(user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  }) {
    return await this.jwtService.signAsync(user);
  }

  async sendConfirmationEmail(user: CreateUserDto) {
    const { confirmationToken, email } = user;

    //await this.emailService.sendConfirmationEmail(email, user);

    return confirmationToken;
  }

  async getTokenPayloadOrThrowError(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);

      return payload;
    } catch (_error) {
      throw new UnauthorizedException(errorMessage.INVALID_TOKEN);
    }
  }

  async generateHashedPassword(password: string) {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    return result;
  }
}
