import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorDal } from '../../../common/dal/error.dal';
import { MembershipDAL } from './membership.dal';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRoles } from '@prisma/client';

const membership = {
  id: 1,
  accountId: 2,
  userId: 2,
  roleId: 2,
  isConfirmed: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('MembershipDAL', () => {
  let membershipDAL: MembershipDAL;
  let prismaService: PrismaService;
  let errorDAL: ErrorDal;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembershipDAL, PrismaService, ErrorDal],
    }).compile();

    membershipDAL = module.get<MembershipDAL>(MembershipDAL);
    errorDAL = module.get<ErrorDal>(ErrorDal);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(membershipDAL).toBeDefined();
  });

  it('should return null if no user found', async () => {
    const userId = 1;

    prismaService.user.findFirst = jest.fn().mockResolvedValue(null);

    const result = await membershipDAL.findUser(userId);

    expect(result).toBeNull();
    expect(prismaService.user.findFirst).toHaveBeenCalledWith({
      where: { id: userId, isConfirmed: true, deletedAt: null },
    });
  });

  it('should handle error when finding user by ID', async () => {
    const userId = 1;
    const error = new Error('Database error');

    prismaService.user.findFirst = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(membershipDAL.findUser(userId)).rejects.toThrow(
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

    prismaService.user.findFirst = jest.fn().mockResolvedValue(mockUser);

    const result = await membershipDAL.findUser(userId);

    expect(result).toEqual(mockUser);
    expect(prismaService.user.findFirst).toHaveBeenCalledWith({
      where: { id: userId, isConfirmed: true, deletedAt: null },
    });
  });

  it('should return empty [] if no membership found', async () => {
    const accountId = 2;

    prismaService.membership.findMany = jest.fn().mockResolvedValue([]);

    const result = await membershipDAL.findAccountMemberships(accountId);

    expect(result).toEqual({ membershipsList: [] });
    expect(prismaService.membership.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null, accountId, isConfirmed: true },
      select: {
        user: { select: { firstName: true, lastName: true, id: true } },
        id: true,
        accountId: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { roleName: true } },
      },
    });
  });

  it('should handle error when finding memberships', async () => {
    const accountId = 1;
    const error = new Error('Database error');

    prismaService.membership.findMany = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(
      membershipDAL.findAccountMemberships(accountId),
    ).rejects.toThrow(InternalServerErrorException);

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should find account memberships by accountID', async () => {
    const accountId = 2;
    const mockMemberships = [
      {
        account: {
          id: 2,
          name: 'Account Name',
          description: 'Account Description',
        },
        role: { roleName: UserRoles.EDITOR },
        user: {
          id: 1,
          firstName: 'Akeron',
          lastName: 'Allkushi',
        },
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prismaService.membership.findMany = jest
      .fn()
      .mockResolvedValue(mockMemberships);

    const expectedMembershipsList = [
      {
        id: 1,
        userId: 1,
        firstName: 'Akeron',
        lastName: 'Allkushi',
        role: UserRoles.EDITOR,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    ];

    const result = await membershipDAL.findAccountMemberships(accountId);

    expect(result).toEqual({ membershipsList: expectedMembershipsList });
    expect(prismaService.membership.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null, accountId, isConfirmed: true },
      select: {
        user: { select: { firstName: true, lastName: true, id: true } },
        id: true,
        accountId: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { roleName: true } },
      },
    });
  });

  it('should return null if no existing membership found', async () => {
    const userId = 1;
    const accountId = 2;

    prismaService.membership.findFirst = jest.fn().mockResolvedValue(null);

    const result = await membershipDAL.findExisitingMembership(
      userId,
      accountId,
    );

    expect(result).toBeNull();
    expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
      where: { userId, accountId, isConfirmed: true, deletedAt: null },
    });
  });

  it('should handle error when finding existing membership by userID and accountID', async () => {
    const userId = 1;
    const accountId = 1;
    const error = new Error('Database error');

    prismaService.membership.findFirst = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(
      membershipDAL.findExisitingMembership(userId, accountId),
    ).rejects.toThrow(InternalServerErrorException);

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should find existing membership by userID and accountID', async () => {
    const userId = 1;
    const accountId = 1;

    prismaService.membership.findFirst = jest
      .fn()
      .mockResolvedValue(membership);

    const result = await membershipDAL.findExisitingMembership(
      userId,
      accountId,
    );

    expect(result).toEqual(membership);
    expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
      where: { userId, accountId, isConfirmed: true, deletedAt: null },
    });
  });

  it('should return null if no unconfirmed membership found', async () => {
    const membershipId = 1;
    const userId = 2;

    prismaService.membership.findFirst = jest.fn().mockResolvedValue(null);

    const result = await membershipDAL.findUnconfirmedInvitation(
      membershipId,
      userId,
    );

    expect(result).toBeNull();
    expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
      where: { id: membershipId, userId, isConfirmed: null, deletedAt: null },
    });
  });

  it('should handle error when finding unconfirmed membership by userID and membershipID', async () => {
    const membershipId = 1;
    const userId = 1;
    const error = new Error('Database error');

    prismaService.membership.findFirst = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(
      membershipDAL.findUnconfirmedInvitation(membershipId, userId),
    ).rejects.toThrow(InternalServerErrorException);

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should find unconfirmed membership by userID and membershipID', async () => {
    const membershipId = 1;
    const userId = 1;

    prismaService.membership.findFirst = jest
      .fn()
      .mockResolvedValue(membership);

    const result = await membershipDAL.findUnconfirmedInvitation(
      membershipId,
      userId,
    );

    expect(result).toEqual(membership);
    expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
      where: { id: membershipId, userId, isConfirmed: null, deletedAt: null },
    });
  });

  it('should return null if no existing invitation found', async () => {
    const userId = 2;
    const accountId = 1;

    prismaService.membership.findFirst = jest.fn().mockResolvedValue(null);

    const result = await membershipDAL.findExistingInvitation(
      userId,
      accountId,
    );

    expect(result).toBeNull();
    expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
      where: { userId, accountId, isConfirmed: null },
    });
  });

  it('should handle error when finding existing invitation by userID and accountID', async () => {
    const userId = 2;
    const accountId = 1;
    const error = new Error('Database error');

    prismaService.membership.findFirst = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(
      membershipDAL.findExistingInvitation(userId, accountId),
    ).rejects.toThrow(InternalServerErrorException);

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should return not found error if can not update membership', async () => {
    const membershipId = 1;
    const userId = 2;

    prismaService.membership.findFirst = jest.fn().mockResolvedValue(null);

    await expect(
      membershipDAL.updateMembership(membershipId, userId),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return null if no membership found', async () => {
    const membershipId = 1;
    const accountId = 2;

    prismaService.membership.findFirst = jest.fn().mockResolvedValue(null);

    const result = await membershipDAL.findMembership(membershipId, accountId);

    expect(result).toBeNull();
    expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
      where: {
        id: membershipId,
        isConfirmed: true,
        deletedAt: null,
        accountId,
      },
      select: {
        id: true,
        role: {
          select: {
            roleName: true,
          },
        },
      },
    });
  });

  it('should handle error when finding a membership', async () => {
    const membershipId = 2;
    const accountId = 1;
    const error = new Error('Database error');

    prismaService.membership.findFirst = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(
      membershipDAL.findMembership(membershipId, accountId),
    ).rejects.toThrow(InternalServerErrorException);

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should return null if no not admin membership found', async () => {
    const accountId = 1;
    const userId = 2;

    prismaService.membership.findFirst = jest.fn().mockResolvedValue(null);

    const result = await membershipDAL.findNotAdminMembership(
      accountId,
      userId,
    );

    expect(result).toBeNull();
    expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
      where: {
        accountId,
        userId,
        deletedAt: null,
        isConfirmed: true,
        role: { roleName: { not: UserRoles.ADMIN } },
      },
    });
  });

  it('should handle error when finding a not admin membership', async () => {
    const accountId = 1;
    const userId = 2;
    const error = new Error('Database error');

    prismaService.membership.findFirst = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(
      membershipDAL.findNotAdminMembership(accountId, userId),
    ).rejects.toThrow(InternalServerErrorException);

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should return null if no admin membership found', async () => {
    const adminId = 2;
    const accountId = 1;

    prismaService.membership.findFirst = jest.fn().mockResolvedValue(null);

    const result = await membershipDAL.findAdminMembership(adminId, accountId);

    expect(result).toBeNull();
    expect(prismaService.membership.findFirst).toHaveBeenCalledWith({
      where: {
        userId: adminId,
        accountId,
        isConfirmed: true,
        role: { roleName: UserRoles.ADMIN },
      },
      select: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  });

  it('should handle error when finding an admin membership', async () => {
    const adminId = 2;
    const accountId = 1;
    const error = new Error('Database error');

    prismaService.membership.findFirst = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(
      membershipDAL.findAdminMembership(adminId, accountId),
    ).rejects.toThrow(InternalServerErrorException);

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should return null if no role record found', async () => {
    const roleName = 'EDITOR';

    prismaService.role.findFirst = jest.fn().mockResolvedValue(null);

    const result = await membershipDAL.findRoleRecord(roleName);

    expect(result).toBeNull();
  });

  it('should handle error when finding a role record', async () => {
    const roleName = 'VIEWER';
    const error = new Error('Database error');

    prismaService.role.findFirst = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(membershipDAL.findRoleRecord(roleName)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });

  it('should return null if no membership by userID found', async () => {
    const userId = 2;

    prismaService.membership.findFirst = jest.fn().mockResolvedValue(null);

    const result = await membershipDAL.findMembershipByUserId(userId);

    expect(result).toBeNull();
  });

  it('should handle error when finding a membership by userID', async () => {
    const userId = 2;
    const error = new Error('Database error');

    prismaService.membership.findFirst = jest.fn().mockRejectedValue(error);
    jest.spyOn(errorDAL, 'handleError');

    await expect(membershipDAL.findMembershipByUserId(userId)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(errorDAL.handleError).toHaveBeenCalledWith(error);
  });
});
