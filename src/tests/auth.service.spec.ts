import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../modules/auth/auth.service';
import { UserModule } from '../modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CreateUserDto } from '../modules/auth/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserDal } from '../modules/user/user.dal';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { errorMessage } from '../constants/error-messages';
import { AuthHelper } from '../modules/auth/auth.helper';
import { Entities } from '../constants/entities';
import { EmailService } from '../modules/email/email.service';
import { controller } from '../constants/controller';
import { controller_path } from '../constants/controller-path';
import { ResetPasswordDto } from '../modules/auth/dto/reset-password.dto';
import { LogInUserDto } from '../modules/auth/dto/login-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userDal: UserDal;
  let authHelper: AuthHelper;
  let emailService: EmailService;

  let user = {
    firstName: 'geri',
    lastName: 'mujo',
    email: 'geri.mujo@softup.co',
    password: 'Geri.mujo1',
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

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userDal = module.get<UserDal>(UserDal);
    authHelper = module.get<AuthHelper>(AuthHelper);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should return confirmationToken and create user', async () => {
    const confirmationToken = await jwtService.sign(user);

    const updatedUser = {
      ...createdUser,
      confirmationToken,
    };

    jest.spyOn(userDal, 'create').mockResolvedValue(createdUser);
    jest.spyOn(userDal, 'update').mockResolvedValue(updatedUser);
    jest.spyOn(userDal, 'findByEmail').mockResolvedValue(null);

    const result = await service.createUser(user);

    const payload = await jwtService.verifyAsync(result);

    const { firstName, lastName, email } = payload;

    expect(firstName).toBeDefined();
    expect(lastName).toBeDefined();
    expect(email).toBeDefined();

    expect(updatedUser.confirmationToken).toBe(confirmationToken);

    expect(firstName).toBe(user.firstName);
    expect(lastName).toBe(user.lastName);
    expect(email).toBe(user.email);
  });

  it('should throw error user exists', async () => {
    const confirmationToken = await jwtService.sign(user);

    const updatedUser = {
      ...createdUser,
      confirmationToken,
    };

    jest.spyOn(userDal, 'create').mockResolvedValue(createdUser);
    jest.spyOn(userDal, 'update').mockResolvedValue(updatedUser);
    jest.spyOn(userDal, 'findByEmail').mockResolvedValue(updatedUser);

    try {
      const result = await service.createUser(user);
      expect(result).not.toBe(createdUser);
    } catch (error) {
      expect(error instanceof UnprocessableEntityException).toBe(true);
      expect(error.message).toBe(errorMessage.EMAIL_IN_USE(user.email));
    }
  });

  it('confirmation token should be generated and user should be updated with the token', async () => {
    const token = await authHelper.generateToken({
      id: createdUser.id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      isTwoFactorAuthenticationEnabled: false,
    });

    jest
      .spyOn(userDal, 'update')
      .mockResolvedValue({ ...createdUser, confirmationToken: token });

    const updatedUser =
      await service.updateConfirmationTokenAndReturnNewUser(createdUser);

    const { confirmationToken, firstName, lastName, email } = updatedUser;

    expect(token).toBe(confirmationToken);
    expect(firstName).toBe(user.firstName);
    expect(lastName).toBe(user.lastName);
  });

  it('confirmEmail must send the email and make the update if token is valid and user exists', async () => {
    const confirmationToken = await authHelper.generateToken({
      id: createdUser.id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      isTwoFactorAuthenticationEnabled: false,
    });

    jest
      .spyOn(
        service,
        'getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists',
      )
      .mockResolvedValue({ ...createdUser, confirmationToken });

    jest.spyOn(userDal, 'update').mockResolvedValue({
      ...createdUser,
      confirmationToken,
      isConfirmed: true,
    });

    const response = await service.confirmEmail(confirmationToken);

    expect(response.message).toBeDefined();
    expect(response.title).toBeDefined();

    expect(response.message).toBe(
      'We are happy to inform you that your account has been successfully confirmed. You can now log in and use all the features of our platform.',
    );
    expect(response.title).toBe('Your Account Has Been Confirmed');
  });

  it('confirmEmail: it should throw error if user decoded by token does not exists', async () => {
    const confirmationToken = await authHelper.generateToken({
      id: createdUser.id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      isTwoFactorAuthenticationEnabled: false,
    });

    jest
      .spyOn(
        service,
        'getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists',
      )
      .mockRejectedValue(
        new NotFoundException(errorMessage.NOT_FOUND(Entities.USER)),
      );

    try {
      const response = await service.confirmEmail(confirmationToken);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof NotFoundException).toBe(true);
      expect(error.message).toBe(errorMessage.NOT_FOUND(Entities.USER));
    }
  });

  it('confirmEmail: it should throw error if user decoded by token is confirmed', async () => {
    const confirmationToken = await authHelper.generateToken({
      id: createdUser.id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      isTwoFactorAuthenticationEnabled: false,
    });

    jest
      .spyOn(
        service,
        'getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists',
      )
      .mockResolvedValue(confirmedUser);

    jest.spyOn(userDal, 'update').mockRejectedValue({
      ...createdUser,
      confirmationToken,
      isConfirmed: true,
    });

    try {
      const response = await service.confirmEmail(confirmationToken);
      expect(response).toBeDefined();
    } catch (error) {
      expect(error instanceof ConflictException).toBe(true);
      expect(error.message).toBe(errorMessage.CONFLICT_ACCOUNT_CONFIRMED);
    }
  });

  it('it should throw error if token is not valid', async () => {
    const confirmationTokenExpired =
      'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsImZpcnN0TmFtZSI6InN0cmluZyIsImxhc3ROYW1lIjoic3RyaW5nIiwiZW1haWwiOiJnZXJpLm11am9Ac29mdHVwLmNvIiwiaWF0IjoxNzI2MDQ1NDc0LCJleHAiOjE3MjYwNDkwNzR9.T7HoH9UNM-XIyJnAq-4dWri8FwbVxOYQSQ_Grsgea3c';

    try {
      const response = await service.confirmEmail(confirmationTokenExpired);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof UnauthorizedException).toBe(true);
      expect(error.message).toBe(errorMessage.INVALID_TOKEN);
    }
  });

  it('resendEmail must resend the email and return new confirmation token', async () => {
    const confirmationTokenInput = jwtService.sign({
      id: createdUser.id,
      ...user,
    });

    jest
      .spyOn(
        service,
        'getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists',
      )
      .mockResolvedValue({
        ...createdUser,
        confirmationToken: confirmationTokenInput,
      });

    jest
      .spyOn(service, 'updateConfirmationTokenAndReturnNewUser')
      .mockResolvedValue({
        ...createdUser,
        confirmationToken: confirmationTokenInput,
      });

    const returnedToken = await service.resendEmail(confirmationTokenInput);
    const payload = await jwtService.verifyAsync(returnedToken);

    expect(payload).toBeDefined();
    expect(payload.firstName).toBe(createdUser.firstName);
    expect(payload.id).toBe(createdUser.id);
    expect(payload.lastName).toBe(createdUser.lastName);
    expect(payload.email).toBe(createdUser.email);
  });

  it('resendEmail must throw error is user is confirmed', async () => {
    const confirmationTokenInput = jwtService.sign({
      id: createdUser.id,
      ...user,
    });

    jest
      .spyOn(
        service,
        'getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists',
      )
      .mockResolvedValue({
        ...createdUser,
        confirmationToken: confirmationTokenInput,
        isConfirmed: true,
      });

    try {
      const returnedToken = await service.resendEmail(confirmationTokenInput);
      expect(returnedToken).not.toBeDefined();
    } catch (error) {
      expect(error instanceof ConflictException).toBe(true);
      expect(error.message).toBe(errorMessage.EMAIL_IS_CONFIRMED);
    }
  });

  it('getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists: should throw error if token is not valid', async () => {
    const token = 'dwbqifeqwf';

    try {
      const result =
        await service.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
          token,
        );
      expect(result).not.toBeDefined();
    } catch (error) {
      expect(error instanceof UnauthorizedException).toBe(true);
      expect(error.message).toBe(errorMessage.INVALID_TOKEN);
    }
  });

  it('getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists: should throw error if user does not exists', async () => {
    const token = jwtService.sign({
      id: createdUser.id,
      ...user,
    });

    jest.spyOn(userDal, 'findOneById').mockResolvedValue(null);

    try {
      const result =
        await service.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
          token,
        );
      expect(result).not.toBeDefined();
    } catch (error) {
      expect(error instanceof NotFoundException).toBe(true);
      expect(error.message).toBe(errorMessage.NOT_FOUND(Entities.USER));
    }
  });

  it('getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists: should return user from token', async () => {
    const token = jwtService.sign({
      id: createdUser.id,
      ...user,
    });

    jest.spyOn(userDal, 'findOneById').mockResolvedValue(createdUser);

    const result =
      await service.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
        token,
      );
    expect(result).toBeDefined();
    expect(result.firstName).toBe(createdUser.firstName);
    expect(result.lastName).toBe(createdUser.lastName);
    expect(result.email).toBe(createdUser.email);
  });

  it('getUserByIdOrThrowError: should throw error if user do not exists', async () => {
    jest.spyOn(userDal, 'findOneById').mockResolvedValue(null);

    try {
      const response = await service.getUserByIdOrThrowError(2);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof NotFoundException).toBe(true);
      expect(error.message).toBe(errorMessage.NOT_FOUND(Entities.USER));
    }
  });

  it('getUserByIdOrThrowError: should return the user', async () => {
    jest.spyOn(userDal, 'findOneById').mockResolvedValue(createdUser);

    const response = await service.getUserByIdOrThrowError(2);
    expect(response).toBe(createdUser);
  });

  it('requestToResetPassword: should throw error if user not exists', async () => {
    jest.spyOn(userDal, 'findByEmail').mockResolvedValue(null);

    try {
      const response = await service.requestToResetPassword(createdUser.email);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof NotFoundException).toBe(true);
      expect(error.message).toBe(errorMessage.NOT_FOUND(Entities.USER));
    }
  });

  it('requestToResetPassword: should send the email if users exsits', async () => {
    jest.spyOn(userDal, 'findByEmail').mockResolvedValue(createdUser);
    jest
      .spyOn(service, 'updateConfirmationTokenAndReturnNewUser')
      .mockResolvedValue(createdUser);
    jest.spyOn(emailService, 'sendResetPasswordEmail').mockResolvedValue();

    const response = await service.requestToResetPassword(createdUser.email);

    expect(response).toBeDefined();
    expect(response).toBe('Please check your email');
  });

  it('resetPasswordForm: it should throw error if token is not valid', async () => {
    const token = 'fewfewfew';

    try {
      const response = await service.resetPasswordForm(token);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof UnauthorizedException).toBe(true);
      expect(error.message).toBe(errorMessage.INVALID_TOKEN);
    }
  });

  it('resetPasswordForm: it should throw error if user do not exists', async () => {
    jest.spyOn(userDal, 'findOneById').mockResolvedValue(null);
    const token = await jwtService.signAsync({ ...user, id: createdUser.id });
    try {
      const response = await service.resetPasswordForm(token);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof NotFoundException).toBe(true);
      expect(error.message).toBe(errorMessage.NOT_FOUND(Entities.USER));
    }
  });

  it('resetPasswordForm: it should throw error if user do not exists', async () => {
    jest.spyOn(userDal, 'findOneById').mockResolvedValue(null);
    const token = await jwtService.signAsync({ ...user, id: createdUser.id });
    try {
      const response = await service.resetPasswordForm(token);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof NotFoundException).toBe(true);
      expect(error.message).toBe(errorMessage.NOT_FOUND(Entities.USER));
    }
  });

  it('resetPasswordForm: it should return the data for the view', async () => {
    const token = await jwtService.signAsync({ ...user, id: createdUser.id });
    jest
      .spyOn(
        service,
        'getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists',
      )
      .mockResolvedValue({ ...createdUser, confirmationToken: token });

    const response = await service.resetPasswordForm(token);
    expect(response).toBeDefined();
    expect(response.prefix).toBeDefined();
    expect(response.path).toBeDefined();
    expect(response.token).toBeDefined();

    expect(response.prefix).toBe(controller.AUTH);
    expect(response.path).toBe(controller_path.AUTH.RESET_PASSWORD);
    expect(response.token).toBe(token);
  });

  it('getUserIfEmailExistsOrThrowError: throw error if user dont exsists', async () => {
    jest.spyOn(userDal, 'findByEmail').mockResolvedValue(null);

    try {
      const result = await service.getUserIfEmailExistsOrThrowError(
        createdUser.email,
      );
      expect(result).not.toBeDefined();
    } catch (error) {
      expect(error instanceof NotFoundException).toBe(true);
      expect(error.message).toBe(errorMessage.NOT_FOUND(Entities.USER));
    }
  });

  it('getUserIfEmailExistsOrThrowError: get user if email exists', async () => {
    jest.spyOn(userDal, 'findByEmail').mockResolvedValue(createdUser);

    const result = await service.getUserIfEmailExistsOrThrowError(
      createdUser.email,
    );
    expect(result).toBe(createdUser);
  });

  it('resetpassword: it throws error if the token is not valid', async () => {
    const token = 'fewfwef';

    try {
      const response = await service.resetPassword(token, resetPasswordDto);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof UnauthorizedException).toBe(true);
      expect(error.message).toBe(errorMessage.INVALID_TOKEN);
    }
  });

  it('resetpassword: it throws error if the user do not exists', async () => {
    const token = await jwtService.signAsync({
      id: createdUser.id,
      ...createdUser,
    });

    jest.spyOn(userDal, 'findOneById').mockResolvedValue(null);

    try {
      const response = await service.resetPassword(token, resetPasswordDto);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof NotFoundException).toBe(true);
      expect(error.message).toBe(errorMessage.NOT_FOUND(Entities.USER));
    }
  });

  it('resetpassword: it throws error if confirmation token is not equal to token', async () => {
    const token = await jwtService.signAsync({
      id: createdUser.id,
      ...createdUser,
    });

    jest
      .spyOn(
        service,
        'getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists',
      )
      .mockResolvedValue({ ...createdUser, confirmationToken: 'token' });

    try {
      const response = await service.resetPassword(token, resetPasswordDto);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof ForbiddenException).toBe(true);
      expect(error.message).toBe(errorMessage.INVALID_TOKEN);
    }
  });

  it('resetpassword: do not return anything ', async () => {
    const token = await jwtService.signAsync({
      id: createdUser.id,
      ...createdUser,
    });

    jest
      .spyOn(
        service,
        'getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists',
      )
      .mockResolvedValue({ ...createdUser, confirmationToken: token });

    jest.spyOn(userDal, 'resetPassword').mockResolvedValue(createdUser);

    const response = await service.resetPassword(token, resetPasswordDto);
    expect(response).not.toBeDefined();
  });

  it('login: should throw error if user do not exists', async () => {
    jest.spyOn(userDal, 'findByEmail').mockResolvedValue(null);

    try {
      const response = await service.login(loginUserDto);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof UnauthorizedException).toBe(true);
      expect(error.message).toBe(errorMessage.INVALID_CREDENTIALS);
    }
  });

  it('login: should return token if password is correct', async () => {
    const hashedPassword = await authHelper.generateHashedPassword(
      createdUser.password,
    );
    jest.spyOn(userDal, 'findByEmail').mockResolvedValue({
      ...createdUser,
      password: hashedPassword,
      isConfirmed: true,
    });

    const response = await service.login(loginUserDto);
    expect(response).toBeDefined();
  });

  it('login: should throw error is credentials are correct and email is not confirmed', async () => {
    const hashedPassword = await authHelper.generateHashedPassword(
      createdUser.password,
    );
    jest.spyOn(userDal, 'findByEmail').mockResolvedValue({
      ...createdUser,
      password: hashedPassword,
    });

    try {
      const response = await service.login(loginUserDto);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof ForbiddenException).toBe(true);
      expect(error.message).toBe(errorMessage.EMAIL_IS_NOT_CONFIRMED);
    }
  });

  it('login: should  throw error if password is not correct', async () => {
    const hashedPassword = await authHelper.generateHashedPassword('fefe');
    jest.spyOn(userDal, 'findByEmail').mockResolvedValue({
      ...createdUser,
      password: hashedPassword,
      isConfirmed: true,
    });

    try {
      const response = await service.login(loginUserDto);
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof UnauthorizedException).toBe(true);
      expect(error.message).toBe(errorMessage.INVALID_CREDENTIALS);
    }
  });

  it('returnUserWithoutPsw: it returns null if the user dont exists ', async () => {
    jest.spyOn(userDal, 'findByEmail').mockResolvedValue(null);

    const result = await service.returnUserWithoutPsw(loginUserDto);

    expect(result).toBe(null);
  });

  it('returnUserWithoutPsw: it returns user without password ', async () => {
    jest.spyOn(service, 'login').mockResolvedValue('cev');
    jest
      .spyOn(
        service,
        'getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists',
      )
      .mockResolvedValue(createdUser);
    const result = await service.returnUserWithoutPsw(loginUserDto);

    expect(result['password']).not.toBeDefined();
  });

  it('initTwoFa: it throws error if the user  not exists', async () => {
    jest.spyOn(userDal, 'findOneById').mockResolvedValue(null);

    try {
      const result = await service.initTwoFa(3);
      expect(result).not.toBeDefined();
    } catch (error) {
      expect(error instanceof NotFoundException).toBe(true);
    }
  });

  it('verify2FaCodeOrThrowError: throws error if code is not valid', async () => {
    jest.spyOn(authHelper, 'validateToken').mockResolvedValue(false);

    try {
      const result = service.verify2FaCodeOrThrowError({}, 23);
      expect(result).not.toBeDefined();
    } catch (error) {
      expect(error instanceof UnauthorizedException).toBe(true);
      expect(error.message).toBe(errorMessage.WRONG_AUTH_CODE);
    }
  });

  it('verify2FaCodeOrThrowError: throws error if code is not valid', async () => {
    jest.spyOn(authHelper, 'validateToken').mockResolvedValue(true);

    const result = service.verify2FaCodeOrThrowError('fe', 234);
    expect(result).not.toBeDefined();
  });
});
