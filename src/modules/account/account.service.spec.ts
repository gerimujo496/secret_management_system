import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountDto } from './dtos/create-account.dto';
import { AccountService } from './account.service';
import { AccountDAL } from './dal/account.dal';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UserRoles } from '@prisma/client';
import { errorMessage } from '../../constants/error-messages';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateAccountDto } from './dtos/update-account.dto';

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

  let myAccountUsers = {
    usersList: [
      {
        roleName: UserRoles.EDITOR,
        userId: 2,
        userFirstName: 'Akeron',
        userLastName: 'Allkushi',
        userEmail: 'oniakeron@gmail.com',
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
    accountId: 2,
    userId: 2,
    roleId: 1,
    isConfirmed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  let updateAccount = {
    name: 'New account Name',
    description: 'New account description',
  } as UpdateAccountDto;

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
            findAccount: jest.fn(),
            findMembership: jest.fn(),
            findUsersMembershipsByAccount: jest.fn(),
            updateAccount: jest.fn(),
            findAllMembershipsForAccount: jest.fn(),
            deleteMembershipsAndAccount: jest.fn(),
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

  it('should return not found if no user found', async () => {
    jest.spyOn(accountDAL, 'findUserById').mockResolvedValue(undefined);

    await expect(accountService.createAccount(account, 1)).rejects.toThrow(
      new NotFoundException(errorMessage.INVALID_ENTITY('user')),
    );
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

  it('should not get all accounts if no userId', async () => {
    await expect(accountService.getAccounts(undefined)).rejects.toThrow(
      new BadRequestException(errorMessage.ID_REQUIRED('User ID')),
    );
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

  it('should return not found it no account found', async () => {
    jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(undefined);

    await expect(accountService.getMyAccount(1, 2)).rejects.toThrow(
      new NotFoundException(errorMessage.INVALID_ENTITY('account')),
    );
  });

  it('should return not found it no membership found', async () => {
    jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(createdAccount);
    jest.spyOn(accountDAL, 'findMembership').mockResolvedValue(undefined);

    await expect(accountService.getMyAccount(1, 2)).rejects.toThrow(
      new NotFoundException(errorMessage.INVALID_ENTITY('membership')),
    );
  });

  it('should get my account', async () => {
    jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(createdAccount);
    jest
      .spyOn(accountDAL, 'findMembership')
      .mockResolvedValue(createdMembership);

    const result = await accountService.getMyAccount(1, 2);

    expect(result).toEqual(createdAccount);
  });

  it('should not get account users of no accountId provided', async () => {
    await expect(accountService.getAccountUsers(undefined)).rejects.toThrow(
      new BadRequestException(errorMessage.ID_REQUIRED('Account ID')),
    );
  });

  it('should return account users', async () => {
    jest
      .spyOn(accountDAL, 'findUsersMembershipsByAccount')
      .mockResolvedValue(myAccountUsers);

    const result = await accountService.getAccountUsers(2);

    expect(result).toEqual(myAccountUsers);
  });

  it('should not update account of no accountId provided', async () => {
    await expect(
      accountService.updateAccount(undefined, updateAccount),
    ).rejects.toThrow(
      new BadRequestException(errorMessage.ID_REQUIRED('Account ID')),
    );
  });

  it('should not update account if no data provided', async () => {
    const updateAccountData = {};

    await expect(
      accountService.updateAccount(2, updateAccountData),
    ).rejects.toThrow(new BadRequestException(errorMessage.EMPTY_DATA));
  });

  it('should not update account if no account found', async () => {
    jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(undefined);

    await expect(
      accountService.updateAccount(2, updateAccount),
    ).rejects.toThrow(
      new NotFoundException(errorMessage.INVALID_ENTITY('account')),
    );
  });

  it('should update account', async () => {
    jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(createdAccount);
    jest
      .spyOn(accountDAL, 'updateAccount')
      .mockResolvedValue({ ...createdAccount, ...updateAccount });

    const result = await accountService.updateAccount(2, updateAccount);

    expect(result).toEqual({ ...createdAccount, ...updateAccount });
  });

  it('should not delete account if no accountId provided', async () => {
    await expect(accountService.deleteAccount(undefined)).rejects.toThrow(
      new BadRequestException(errorMessage.ID_REQUIRED('Account ID')),
    );
  });

  it('should not delete account if membershipArray empty', async () => {
    jest
      .spyOn(accountDAL, 'findAllMembershipsForAccount')
      .mockResolvedValue([]);

    await expect(accountService.deleteAccount(4)).rejects.toThrow(
      new NotFoundException(errorMessage.INVALID_ENTITY('account')),
    );
  });

  it('should not delete account and memberships', async () => {
    jest
      .spyOn(accountDAL, 'findAllMembershipsForAccount')
      .mockResolvedValue([createdMembership]);

    jest
      .spyOn(accountDAL, 'deleteMembershipsAndAccount')
      .mockResolvedValue([createdAccount, { count: 1 }]);

    const result = await accountService.deleteAccount(2);

    expect(result).toEqual({
      deletedAccount: createdAccount,
      deletedMemberships: { count: 1 },
    });
  });
});
