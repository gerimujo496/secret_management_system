import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import * as SpeakEasy from 'speakeasy';
import * as QRCode from 'qrcode';

import { EmailService } from '../email/email.service';
import { UserDal } from '../user/user.dal';
import { CreateUserDto } from './dto/create-user.dto';
import { errorMessage } from '../../constants/error-messages';
import { JsonValue } from '@prisma/client/runtime/library';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthHelper {
  constructor(
    private jwtService: JwtService,
    private emailService: EmailService,
    private usersDal: UserDal,
  ) {}

  async generateToken({
    id,
    firstName,
    lastName,
    email,
    isTwoFactorAuthenticationEnabled,
    isTwoFactorAuthenticated = false,
  }: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isTwoFactorAuthenticationEnabled: boolean;
    isTwoFactorAuthenticated?: boolean;
  }) {
    return await this.jwtService.signAsync({
      id,
      firstName,
      lastName,
      email,
      isTwoFactorAuthenticated,
      isTwoFactorAuthenticationEnabled,
    });
  }

  async sendConfirmationEmail(user: CreateUserDto) {
    const { confirmationToken, email } = user;

    await this.emailService.sendConfirmationEmail(email, user);

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

  generateSecret(email: string) {
    const secret = SpeakEasy.generateSecret({
      length: 32,
      issuer: 'Secret Management System',
      name: `Secret Management System (${email})`,
    });

    return secret;
  }
  async generateQRCode(secret: any) {
    try {
      return await QRCode.toDataURL(secret.otpauth_url);
    } catch (error) {
      console.log(error);
    }
  }

  generateQRToken(secret) {
    const token = SpeakEasy.totp({
      secret: secret.base32,
      encoding: 'base32',
    });

    return token;
  }

  validateToken(secret, userToken) {
    return SpeakEasy.totp.verify({
      secret: secret.base32,
      encoding: 'base32',
      token: userToken,
    });
  }
}
