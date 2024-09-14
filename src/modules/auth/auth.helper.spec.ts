import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { errorMessage } from '../../constants/error-messages';
import { AuthHelper } from './auth.helper';
import { EmailService } from '../email/email.service';

describe('AuthService', () => {
  let jwtService: JwtService;

  let authHelper: AuthHelper;
  let emailService: EmailService;

  const user = {
    firstName: 'geri',
    lastName: 'mujo',
    email: 'geri.mujo@softup.co',
    password: 'Geri.mujo1',
  } as CreateUserDto;

  const createdUser = {
    ...user,
    id: 2,
    confirmationToken: null,
    isConfirmed: null,
    is2FaEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
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

    jwtService = module.get<JwtService>(JwtService);
    authHelper = module.get<AuthHelper>(AuthHelper);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(authHelper).toBeDefined();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('generateToken: it should generate the token', async () => {
    const result = await authHelper.generateToken({
      ...user,
      id: createdUser.id,
    });

    expect(result).toBeDefined();
    const payload = await jwtService.verifyAsync(result);

    expect(payload).toBeDefined();
    expect(payload.firstName).toBe(user.firstName);
    expect(payload.lastName).toBe(user.lastName);
    expect(payload.email).toBe(user.email);
    expect(payload.id).toBe(createdUser.id);
  });

  it('sendConfirmationEmail: it should send the email', async () => {
    jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValue();
    const result = await authHelper.sendConfirmationEmail({
      ...createdUser,
      confirmationToken: 'token',
    });

    expect(result).toBeDefined();
    expect(result).toBe('token');
  });

  it('getTokenPayloadOrThrowError:  should return the payload', async () => {
    const token = await authHelper.generateToken({
      ...user,
      id: createdUser.id,
    });
    const payload = await authHelper.getTokenPayloadOrThrowError(token);

    expect(payload).toBeDefined();
    expect(payload.firstName).toBe(user.firstName);
    expect(payload.lastName).toBe(user.lastName);
    expect(payload.email).toBe(user.email);
    expect(payload.id).toBe(createdUser.id);
  });

  it('getTokenPayloadOrThrowError:  should throw error if token is not valid', async () => {
    try {
      const response = await authHelper.getTokenPayloadOrThrowError('fefe');
      expect(response).not.toBeDefined();
    } catch (error) {
      expect(error instanceof UnauthorizedException).toBe(true);
      expect(error.message).toBe(errorMessage.INVALID_TOKEN);
    }
  });

  it('generateHashedPassword: it should generate the hashed password', async () => {
    const result = await authHelper.generateHashedPassword(user.password);
    expect(result).toBeDefined();
    expect(result).not.toBe(user.password);
  });
});
