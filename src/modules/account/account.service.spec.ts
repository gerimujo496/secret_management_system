import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountDto } from './dtos/create-account.dto';
import { AccountService } from './account.service';
import { AccountDAL } from './dal/account.dal';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UserRoles } from '@prisma/client';
import { errorMessage } from '../../constants/error-messages';
import { BadRequestException } from '@nestjs/common';

describe('AccountService', () => {
  let accountService: AccountService;
  let accountDAL: AccountDAL;

  const account: CreateAccountDto = {
    name: 'Secret',
    description: 'Here world secrets are shared',
  };

  const createdAccount = {
    ...account,
    id: 2,
    password: '133422dasxa',
    isConfirmed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  let user = {
    firstName: 'geri',
    lastName: 'mujo',
    email: 'geri.mujo@softup.co',
    password: 'Geri.mujo1',
  } as CreateUserDto;

  let myAccounts = {
    accountsList: [
      {
        name: 'Akeron',
        description: 'Secret Account',
        id: 1,
        role: UserRoles.ADMIN,
      },
    ],
  };

  let createdUser = {
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

  let createdMembership = {
    id: 1,
    accountId: 1,
    userId: 2,
    roleId: 1,
    isConfirmed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountDAL,
          useValue: {
            createAccount: jest.fn(),
            findUserById: jest.fn(),
            createMembershipAndAccount: jest.fn(),
            findMyAccounts: jest.fn(),
          },
        },
      ],
    }).compile();

    accountService = module.get<AccountService>(AccountService);
    accountDAL = module.get<AccountDAL>(AccountDAL);
  });

  it('should be defined', () => {
    expect(accountService).toBeDefined();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should not create an account if userId is not provided', async () => {
    await expect(
      accountService.createAccount(account, undefined),
    ).rejects.toThrow(
      new BadRequestException(errorMessage.ID_REQUIRED('User ID')),
    );
  });

  it('should find user by Id', async () => {
    jest.spyOn(accountDAL, 'findUserById').mockResolvedValue(createdUser);
    const result = await accountDAL.findUserById(2);

    expect(result).toEqual(createdUser);
  });

  it('should create account', async () => {
    jest.spyOn(accountDAL, 'findUserById').mockResolvedValue(createdUser);
    jest
      .spyOn(accountDAL, 'createMembershipAndAccount')
      .mockResolvedValue([createdAccount, createdMembership]);

    const user = await accountDAL.findUserById(2);
    const result = await accountDAL.createMembershipAndAccount(
      account,
      user.id,
      createdAccount.password,
    );

    expect(result).toEqual([createdAccount, createdMembership]);
  });

  it('should get all accounts', async () => {
    jest.spyOn(accountDAL, 'findMyAccounts').mockResolvedValue(myAccounts);

    const result = await accountDAL.findMyAccounts(2);

    expect(result).toEqual(myAccounts);
  });

  it('should not get one account if not userId provided', async () => {
    await expect(accountService.getMyAccount(undefined, 2)).rejects.toThrow(
      new BadRequestException(
        errorMessage.BOTH_REQUIRED('User ID', 'Account ID'),
      ),
    );
  });

  it('should not get one account if not accoundId provided', async () => {
    await expect(accountService.getMyAccount(1, undefined)).rejects.toThrow(
      new BadRequestException(
        errorMessage.BOTH_REQUIRED('User ID', 'Account ID'),
      ),
    );
  });
});
