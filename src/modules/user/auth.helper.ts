import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { UserDal } from './user.dal';
import { errorMessage } from 'src/constants/errorMessages';
import { Entities } from '../../constants/entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
    const { firstName, lastName, email } = user;

    const confirmationToken = await this.generateToken({
      id: user['id'],
      firstName,
      lastName,
      email,
    });

    const newUser = await this.usersDal.update(user['id'], {
      confirmationToken,
    } as UpdateUserDto);

    await this.emailService.sendConfirmationEmail(newUser.email, newUser);
  }

  async getTokenPayloadOrThrowError(token: string) {
    const payload = await this.jwtService.verifyAsync(token);

    return payload;
  }
}
