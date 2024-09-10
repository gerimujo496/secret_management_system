import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

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
      const { firstName, lastName, email, password } = createUserDto;

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

      await this.authHelper.sendConfirmationEmail(registeredUser);

      return registeredUser;
    } catch (error) {
      throwError(error.status, error.message);
    }
  }

  async confirmEmail(token: string) {
    try {
      const payload = await this.authHelper.getTokenPayloadOrThrowError(token);
      const { id } = payload;
      const user = await this.usersDal.findOneById(id);

      if (!user)
        throw new NotFoundException(
          errorMessage.NOT_FOUND(Entities.USER, Properties.ID, `${id}`),
        );

      if (user.isConfirmed)
        throw new ConflictException(errorMessage.CONFLICT_ACCOUNT_CONFIRMED);

      if (user.confirmationToken != token)
        throw new ForbiddenException(errorMessage.INVALID_TOKEN);

      const updateBody = { isConfirmed: true } as ConfirmEmailDto;

      await this.usersDal.update(payload.id, updateBody);

      return { view: 'index' };
    } catch (error) {
      throwError(
        error.status ? error.status : HttpStatus.FORBIDDEN,
        error.message,
      );
    }
  }

  findOne(id: number) {
    return { view: 'index' };
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
