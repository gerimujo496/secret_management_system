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
import { ConfigService } from '@nestjs/config';

import { UserService } from './user.service';
import { EmailService } from '../email/email.service';
import { AuthHelper } from './auth.helper';
import { UserDal } from './user.dal';
import { CreateUserDto } from './dto/create-user.dto';
import { errorMessage } from '../../constants/errorMessages';
import { throwError } from '../.././modules/helpers/throwError';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Entities } from 'src/constants/entities';
import { Properties } from 'src/constants/properties';
import { controller } from 'src/constants/controller';
import { controller_path } from 'src/constants/controllerPath';
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
    try {
      const { email, password } = createUserDto;

      const user = await this.usersDal.findByEmail(email);

      if (user) {
        throw new UnprocessableEntityException(
          errorMessage.EMAIL_IN_USE(email),
        );
      }
      const salt = randomBytes(8).toString('hex');
      const hash = (await scrypt(password, salt, 32)) as Buffer;
      const result = salt + '.' + hash.toString('hex');

      const registerUser: CreateUserDto = {
        ...createUserDto,
        password: result,
      };
      const registeredUser = await this.usersDal.create(registerUser);

      const newUser =
        await this.authHelper.updateConfirmationTokenAndReturnNewUser(
          registeredUser,
        );

      const confirmationToken =
        await this.authHelper.sendConfirmationEmail(newUser);

      return confirmationToken;
    } catch (error) {
      throwError(error.status, error.message);
    }
  }

  async confirmEmail(token: string) {
    try {
      const user =
        await this.authHelper.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
          token,
        );
      const { id } = user;

      if (!user)
        throw new NotFoundException(
          errorMessage.NOT_FOUND(Entities.USER, Properties.ID, `${id}`),
        );

      if (user.isConfirmed)
        throw new ConflictException(errorMessage.CONFLICT_ACCOUNT_CONFIRMED);

      if (user.confirmationToken != token)
        throw new ForbiddenException(errorMessage.INVALID_TOKEN);

      const updateBody = { isConfirmed: true } as ConfirmEmailDto;

      await this.usersDal.update(id, updateBody);

      return { view: 'index' };
    } catch (error) {
      throwError(
        error.status ? error.status : HttpStatus.FORBIDDEN,
        error.message,
      );
    }
  }

  async resendEmail(token: string) {
    try {
      const user =
        await this.authHelper.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
          token,
        );
      if (user.isConfirmed)
        throw new ConflictException(errorMessage.EMAIL_IS_CONFIRMED);

      const newUser =
        await this.authHelper.updateConfirmationTokenAndReturnNewUser(user);

      const confirmationToken =
        await this.authHelper.sendConfirmationEmail(newUser);

      return confirmationToken;
    } catch (error) {
      throwError(
        error.status ? error.status : HttpStatus.FORBIDDEN,
        error.message,
      );
    }
  }

  async requestToResetPassword(email: string) {
    try {
      const user =
        await this.authHelper.getUserIfEmailExistsOrThrowError(email);

      const newUser =
        await this.authHelper.updateConfirmationTokenAndReturnNewUser(user);

      await this.emailService.sendResetPasswordEmail(newUser.email, newUser);

      return 'Please check your email';
    } catch (error) {
      throwError(
        error.status ? error.status : HttpStatus.FORBIDDEN,
        error.message,
      );
    }
  }

  async resetPasswordForm(token: string) {
    try {
      const user =
        await this.authHelper.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
          token,
        );
      if (user.confirmationToken != token)
        throw new ForbiddenException(errorMessage.INVALID_TOKEN);

      return {
        prefix: controller.AUTH,
        path: controller_path.AUTH.RESET_PASSWORD,
        token: token,
      };
    } catch (error) {
      throwError(
        error.status ? error.status : HttpStatus.FORBIDDEN,
        error.message,
      );
    }
  }

  async resetPassword(token: string, resetPassword: ResetPasswordDto) {
    try {
      const { password } = resetPassword;

      const user =
        await this.authHelper.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
          token,
        );

      if (user.confirmationToken != token)
        throw new ForbiddenException(errorMessage.INVALID_TOKEN);

      const salt = randomBytes(8).toString('hex');
      const hash = (await scrypt(password, salt, 32)) as Buffer;
      const result = salt + '.' + hash.toString('hex');

      const newResetPasswordDto = {
        password: result,
        confirmPassword: result,
      } as ResetPasswordDto;

      await this.usersDal.resetPassword(user.id, newResetPasswordDto.password);
    } catch (error) {
      throwError(
        error.status ? error.status : HttpStatus.FORBIDDEN,
        error.message,
      );
    }
  }

  async login(loginUserDto: LogInUserDto) {
    try {
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
    } catch (error) {
      throwError(
        error.status ? error.status : HttpStatus.FORBIDDEN,
        error.message,
      );
    }
  }
}
