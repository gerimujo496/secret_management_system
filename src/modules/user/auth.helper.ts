import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { UserDal } from './user.dal';
import { errorMessage } from 'src/constants/errorMessages';
import { Entities } from '../../constants/entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Properties } from 'src/constants/properties';

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

  async updateConfirmationTokenAndReturnNewUser(user: CreateUserDto) {
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

    return newUser;
  }
  async sendConfirmationEmail(user: CreateUserDto) {
    const { confirmationToken, email } = user;

    await this.emailService.sendConfirmationEmail(email, user);

    return confirmationToken;
  }

  async getTokenPayloadOrThrowError(token: string) {
    const payload = await this.jwtService.verifyAsync(token);

    return payload;
  }

  async getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
    token: string,
  ) {
    const payload = await this.getTokenPayloadOrThrowError(token);
    const { id } = payload;
    const user = await this.getUserByIdOrThrowError(id);

    return user;
  }

  async getUserByIdOrThrowError(id: number) {
    const user = await this.usersDal.findOneById(id);
    if (!user)
      throw new NotFoundException(errorMessage.NOT_FOUND(Entities.USER));

    return user;
  }

  async getUserIfEmailExistsOrThrowError(email: string) {
    const user = this.usersDal.findByEmail(email);

    if (!user)
      throw new NotFoundException(errorMessage.NOT_FOUND(Entities.USER));

    return user;
  }
}
