import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from '../src/modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';

import { errorMessage } from '../src/constants/error-messages';
import { AuthHelper } from '../src/modules/auth/auth.helper';
import { Entities } from '../src/constants/entities';
import { EmailService } from '../src/modules/email/email.service';
import { controller } from '../src/constants/controller';
import { controller_path } from '../src/constants/controller-path';
import { ResetPasswordDto } from '../src/modules/auth/dto/reset-password.dto';
import { LogInUserDto } from '../src/modules/auth/dto/login-user.dto';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserDal } from '../src/modules/user/user.dal';
import { CreateUserDto } from '../src/modules/auth/dto/create-user.dto';

describe('auth controller e2e', () => {
  let app: INestApplication;
  let service: AuthService;
  let jwtService: JwtService;
  let userDal: UserDal;
  let authHelper: AuthHelper;
  let emailService: EmailService;

  let user = {
    firstName: 'geri',
    lastName: 'mujo',
    email: 'geri.mujo@softup.co',
    password: 'Geri',
  } as CreateUserDto;

  let createdUser = {
    ...user,
    id: 2,
    confirmationToken: null,
    isConfirmed: null,
    twoFactorAuthenticationSecret: null,
    isTwoFactorAuthenticationEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  let confirmedUser = {
    ...user,
    id: 2,
    confirmationToken: null,
    isConfirmed: true,
    twoFactorAuthenticationSecret: null,
    isTwoFactorAuthenticationEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  let resetPasswordDto = {
    password: 'Geri.mujo1',
    confirmPassword: 'Geri.mujo1',
  } as ResetPasswordDto;

  let loginUserDto = {
    email: 'geri.mujo@softup.co',
    password: 'Geri.mujo1',
  } as LogInUserDto;

  let url = (routePath: string) => {
    return `/${controller.AUTH}/${routePath}`;
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userDal = module.get<UserDal>(UserDal);
    authHelper = module.get<AuthHelper>(AuthHelper);
    emailService = module.get<EmailService>(EmailService);

    await app.init();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('/auth/sign_up (POST): it should create a new user ', async () => {
    const response = await request(app.getHttpServer())
      .post(url(controller_path.AUTH.SIGN_UP))
      .send(user);
  });
});
