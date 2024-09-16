import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

import { UserService } from './user.service';
import { EmailService } from '../email/email.service';
import { AuthHelper } from './auth.helper';
import { UserDal } from './user.dal';
import { CreateUserDto } from './dto/create-user.dto';
import { errorMessage } from '../../constants/error-messages';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Entities } from '../../constants/entities';
import { UserProperties } from '../../constants/properties';
import { controller } from '../../constants/controller';
import { controller_path } from '../../constants/controller-path';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LogInUserDto } from './dto/login-user.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private usersDal: UserDal,
    private emailService: EmailService,
    private authHelper: AuthHelper,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const user = await this.usersDal.findByEmail(email);

    if (user) {
      throw new UnprocessableEntityException(errorMessage.EMAIL_IN_USE(email));
    }

    const result = await this.authHelper.generateHashedPassword(password);

    const userDto: CreateUserDto = {
      ...createUserDto,
      password: result,
    };
    const registeredUser = await this.usersDal.create(userDto);

    const newUser =
      await this.updateConfirmationTokenAndReturnNewUser(registeredUser);

    const confirmationToken =
      await this.authHelper.sendConfirmationEmail(newUser);

    return confirmationToken;
  }

  async updateConfirmationTokenAndReturnNewUser(user: CreateUserDto) {
    const { firstName, lastName, email } = user;

    const confirmationToken = await this.authHelper.generateToken({
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

  async confirmEmail(token: string) {
    const user =
      await this.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
        token,
      );

    const { id } = user;

    if (!user)
      throw new NotFoundException(
        errorMessage.NOT_FOUND(Entities.USER, UserProperties.ID, `${id}`),
      );

    if (user.isConfirmed)
      throw new ConflictException(errorMessage.CONFLICT_ACCOUNT_CONFIRMED);

    if (user.confirmationToken != token)
      throw new ForbiddenException(errorMessage.INVALID_TOKEN);

    const updateBody = { isConfirmed: true } as ConfirmEmailDto;

    await this.usersDal.update(id, updateBody);

    return { view: 'index' };
  }

  async resendEmail(token: string) {
    const user =
      await this.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
        token,
      );

    if (user.isConfirmed)
      throw new ConflictException(errorMessage.EMAIL_IS_CONFIRMED);

    if (user.confirmationToken != token)
      throw new UnauthorizedException(errorMessage.INVALID_TOKEN);

    const newUser = await this.updateConfirmationTokenAndReturnNewUser(user);

    const confirmationToken =
      await this.authHelper.sendConfirmationEmail(newUser);

    return confirmationToken;
  }

  async getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
    token: string,
  ) {
    const payload = await this.authHelper.getTokenPayloadOrThrowError(token);
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

  async requestToResetPassword(email: string) {
    const user = await this.getUserIfEmailExistsOrThrowError(email);

    const newUser = await this.updateConfirmationTokenAndReturnNewUser(user);

    await this.emailService.sendResetPasswordEmail(newUser.email, newUser);

    return 'Please check your email';
  }

  async resetPasswordForm(token: string) {
    const user =
      await this.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
        token,
      );
    if (user.confirmationToken != token)
      throw new ForbiddenException(errorMessage.INVALID_TOKEN);

    return {
      prefix: controller.AUTH,
      path: controller_path.AUTH.RESET_PASSWORD,
      token: token,
    };
  }
  async getUserIfEmailExistsOrThrowError(email: string) {
    const user = await this.usersDal.findByEmail(email);

    if (!user)
      throw new NotFoundException(errorMessage.NOT_FOUND(Entities.USER));

    return user;
  }

  async resetPassword(token: string, resetPassword: ResetPasswordDto) {
    const { password } = resetPassword;

    const user =
      await this.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
        token,
      );

    if (user.confirmationToken != token)
      throw new ForbiddenException(errorMessage.INVALID_TOKEN);

    const result = await this.authHelper.generateHashedPassword(password);

    const newResetPasswordDto = {
      password: result,
      confirmPassword: result,
    } as ResetPasswordDto;

    await this.usersDal.resetPassword(user.id, newResetPasswordDto.password);
  }

  async login(loginUserDto: LogInUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.usersDal.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(errorMessage.INVALID_CREDENTIALS);
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new UnauthorizedException(errorMessage.INVALID_CREDENTIALS);
    }

    if (!user.isConfirmed)
      throw new ForbiddenException(errorMessage.EMAIL_IS_NOT_CONFIRMED);

    const token = await this.authHelper.generateToken(user);

    return token;
  }
}
