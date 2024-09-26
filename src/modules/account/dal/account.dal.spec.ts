import { Test, TestingModule } from '@nestjs/testing';
import { AccountDAL } from './account.dal';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorDal } from '../../../common/dal/error.dal';
import { InternalServerErrorException } from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { UpdateAccountDto } from '../dtos/update-account.dto';

describe('AccountDAL', () => {
  let accountDAL: AccountDAL;
  let prismaService: PrismaService;
  let errorDAL: ErrorDal;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountDAL, PrismaService, ErrorDal],
    }).compile();

    accountDAL = module.get<AccountDAL>(AccountDAL);
    errorDAL = module.get<ErrorDal>(ErrorDal);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(accountDAL).toBeDefined();
  });

  it('should return null if no user found', async () => {
    const userId = 1;

    prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

    const result = await accountDAL.findUserById(userId);

    expect(result).toBeNull();
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId, isConfirmed: true, deletedAt: null },
    });
  });

  it('should handle error when finding user by ID', async () => {
    const userId = 1;
    const error = new Error('Database error');

    prismaService.user.findUnique = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(accountDAL.findUserById(userId)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should find user by ID', async () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
      isConfirmed: true,
    };

    prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);

    const result = await accountDAL.findUserById(userId);

    expect(result).toEqual(mockUser);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId, isConfirmed: true, deletedAt: null },
    });
  });

  it('should return null if no membership found', async () => {
    const userId = 1;
    const accountId = 2;

    prismaService.membership.findFirst = jest.fn().mockResolvedValue(null);

    const result = await accountDAL.findMembership(accountId, userId);

    expect(result).toBeNull();
    expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
      where: { userId, accountId, isConfirmed: true, deletedAt: null },
    });
  });

  it('should handle error when finding membership', async () => {
    const userId = 1;
    const accountId = 2;
    const error = new Error('Database error');

    prismaService.membership.findFirst = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(accountDAL.findMembership(accountId, userId)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should find membership by accountId and userId', async () => {
    const userId = 1;
    const accountId = 2;

    let mockMemebership = {
      id: 1,
      accountId,
      userId,
      roleId: 1,
      isConfirmed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    prismaService.membership.findFirst = jest
      .fn()
      .mockResolvedValue(mockMemebership);

    const result = await accountDAL.findMembership(accountId, userId);

    expect(result).toEqual(mockMemebership);
    expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
      where: { userId, accountId, isConfirmed: true, deletedAt: null },
    });
  });

  it('should return empty array if no membership found', async () => {
    const accountId = 2;

    prismaService.membership.findMany = jest.fn().mockResolvedValue([]);

    const result = await accountDAL.findAllMembershipsForAccount(accountId);

    expect(result).toEqual([]);
    expect(prismaService.membership.findMany).toHaveBeenCalledWith({
      where: { accountId, isConfirmed: true, deletedAt: null },
    });
  });

  it('should handle error when finding membership for account', async () => {
    const accountId = 2;
    const error = new Error('Database error');

    prismaService.membership.findMany = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(
      accountDAL.findAllMembershipsForAccount(accountId),
    ).rejects.toThrow(InternalServerErrorException);

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should find memberships for account', async () => {
    let accountId = 2;
    let mockMemeberships = [
      {
        id: 1,
        accountId,
        userId: 2,
        roleId: 1,
        isConfirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    prismaService.membership.findMany = jest
      .fn()
      .mockResolvedValue(mockMemeberships);

    const result = await accountDAL.findAllMembershipsForAccount(accountId);

    expect(result).toEqual(mockMemeberships);
    expect(prismaService.membership.findMany).toHaveBeenCalledWith({
      where: { accountId, isConfirmed: true, deletedAt: null },
    });
  });

  it('should return null if no account found', async () => {
    const accountId = 1;

    prismaService.account.findFirst = jest.fn().mockResolvedValue(null);

    const result = await accountDAL.findAccount(accountId);

    expect(result).toBeNull();
    expect(prismaService.account.findFirst).toHaveBeenCalledWith({
      where: { id: accountId, deletedAt: null },
    });
  });

  it('should handle error when finding account by ID', async () => {
    const accountId = 1;
    const error = new Error('Database error');

    prismaService.account.findFirst = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(accountDAL.findAccount(accountId)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should find account by ID', async () => {
    const accoundId = 1;
    const mockAccount = {
      id: accoundId,
      name: 'Account Name',
      description: 'Account Description',
      isConfirmed: true,
    };

    prismaService.account.findFirst = jest.fn().mockResolvedValue(mockAccount);

    const result = await accountDAL.findAccount(accoundId);

    expect(result).toEqual(mockAccount);
    expect(prismaService.account.findFirst).toHaveBeenCalledWith({
      where: { id: accoundId, deletedAt: null },
    });
  });

  it('should return empty [] if no account found', async () => {
    const userId = 1;

    prismaService.membership.findMany = jest.fn().mockResolvedValue([]);

    const result = await accountDAL.findMyAccounts(userId);

    expect(result).toEqual({ accountsList: [] });
    expect(prismaService.membership.findMany).toHaveBeenCalledWith({
      where: { userId, isConfirmed: true, deletedAt: null },
      select: {
        account: {
          select: { name: true, id: true, description: true },
        },
        role: { select: { roleName: true } },
      },
    });
  });

  it('should handle error when finding accounts', async () => {
    const userId = 1;
    const error = new Error('Database error');

    prismaService.membership.findMany = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(accountDAL.findMyAccounts(userId)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should find my accounts by userID', async () => {
    const userId = 2;
    const mockMemberships = [
      {
        account: {
          id: 2,
          name: 'Account Name',
          description: 'Account Description',
        },
        role: { roleName: UserRoles.EDITOR },
      },
    ];

    prismaService.membership.findMany = jest
      .fn()
      .mockResolvedValue(mockMemberships);

    const expectedAccountsList = [
      {
        id: 2,
        name: 'Account Name',
        description: 'Account Description',
        role: UserRoles.EDITOR,
      },
    ];

    const result = await accountDAL.findMyAccounts(userId);

    expect(result).toEqual({ accountsList: expectedAccountsList });
    expect(prismaService.membership.findMany).toHaveBeenCalledWith({
      where: {
        userId,
        isConfirmed: true,
        deletedAt: null,
      },
      select: {
        account: {
          select: { name: true, id: true, description: true },
        },
        role: { select: { roleName: true } },
      },
    });
  });

  it('should return empty [] if no memberships found', async () => {
    const accountId = 1;

    prismaService.membership.findMany = jest.fn().mockResolvedValue([]);

    const result = await accountDAL.findUsersMembershipsByAccount(accountId);

    expect(result).toEqual({ users: [] });
    expect(prismaService.membership.findMany).toHaveBeenCalledWith({
      where: { accountId, deletedAt: null, isConfirmed: true },
      select: {
        role: {
          select: {
            roleName: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  });

  it('should handle error when finding account by ID', async () => {
    const accountId = 1;
    const error = new Error('Database error');

    prismaService.membership.findMany = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(
      accountDAL.findUsersMembershipsByAccount(accountId),
    ).rejects.toThrow(InternalServerErrorException);

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should find memberships by accountID', async () => {
    const accountId = 1;
    const mockMemberships = [
      {
        user: {
          id: 2,
          firstName: 'Akeron',
          lastName: 'Allkushi',
          email: 'oniakeron@gmail.com',
        },
        role: { roleName: UserRoles.EDITOR },
      },
    ];

    prismaService.membership.findMany = jest
      .fn()
      .mockResolvedValue(mockMemberships);

    const result = await accountDAL.findUsersMembershipsByAccount(accountId);

    const expectedUsersList = [
      {
        roleName: UserRoles.EDITOR,
        userId: 2,
        userFirstName: 'Akeron',
        userLastName: 'Allkushi',
        userEmail: 'oniakeron@gmail.com',
      },
    ];

    expect(result).toEqual({ usersList: expectedUsersList });
    expect(prismaService.membership.findMany).toHaveBeenCalledWith({
      where: { accountId, deletedAt: null, isConfirmed: true },
      select: {
        role: {
          select: {
            roleName: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  });

  it('should handle error when creating an account and a membership', async () => {
    const createAccountDto: CreateAccountDto = {
      name: 'Test Account',
      description: 'A test account',
    };
    const userId = 1;
    const password = 'securepassword';
    const error = new Error('Database error');

    prismaService.$transaction = jest.fn().mockImplementation(async (cb) => {
      throw error;
    });

    prismaService.role.findFirst = jest
      .fn()
      .mockResolvedValue({ id: 1, roleName: UserRoles.ADMIN });

    jest.spyOn(errorDAL, 'handleError');

    await expect(
      accountDAL.createMembershipAndAccount(createAccountDto, userId, password),
    ).rejects.toThrow(InternalServerErrorException);

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should create a membership and an account', async () => {
    const createAccountDto: CreateAccountDto = {
      name: 'Test Account',
      description: 'A test account',
    };
    const userId = 1;
    const password = 'securepassword';

    const mockAccount = { id: 1, ...createAccountDto };
    const mockMembership = {
      id: 1,
      userId,
      accountId: mockAccount.id,
      roleId: 1,
      isConfirmed: true,
    };

    prismaService.$transaction = jest.fn().mockImplementation(async (cb) => {
      return await cb(prismaService);
    });
    prismaService.account.create = jest.fn().mockResolvedValue(mockAccount);
    prismaService.role.findFirst = jest
      .fn()
      .mockResolvedValue({ id: 1, roleName: UserRoles.ADMIN });
    prismaService.membership.create = jest
      .fn()
      .mockResolvedValue(mockMembership);

    const result = await accountDAL.createMembershipAndAccount(
      createAccountDto,
      userId,
      password,
    );

    expect(result).toEqual([mockAccount, mockMembership]);
    expect(prismaService.account.create).toHaveBeenCalledWith({
      data: { ...createAccountDto, password },
    });
    expect(prismaService.membership.create).toHaveBeenCalledWith({
      data: {
        userId,
        accountId: mockAccount.id,
        roleId: 1,
        isConfirmed: true,
      },
    });
  });

  it('should handle error when updating an account', async () => {
    const accountId = 1;
    const newAccountInformation: UpdateAccountDto = {
      name: 'Updated Account Name',
      description: 'Updated Account Description',
    };
    const error = new Error('Database error');

    prismaService.account.update = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(
      accountDAL.updateAccount(accountId, newAccountInformation),
    ).rejects.toThrow(InternalServerErrorException);

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should update an account and return the updated account', async () => {
    const accountId = 1;
    const newAccountInformation: UpdateAccountDto = {
      name: 'Updated Account Name',
      description: 'Updated Account Description',
    };

    const mockUpdatedAccount = {
      id: accountId,
      name: newAccountInformation.name,
      description: newAccountInformation.description,
      deletedAt: null,
    };

    prismaService.account.update = jest
      .fn()
      .mockResolvedValue(mockUpdatedAccount);

    const result = await accountDAL.updateAccount(
      accountId,
      newAccountInformation,
    );

    expect(result).toEqual(mockUpdatedAccount);
    expect(prismaService.account.update).toHaveBeenCalledWith({
      where: { id: accountId, deletedAt: null },
      data: { ...newAccountInformation },
    });
  });
});
