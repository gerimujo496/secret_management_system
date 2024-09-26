import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorDal } from '../../../common/dal/error.dal';
import { MembershipDAL } from './membership.dal';
import { InternalServerErrorException } from '@nestjs/common';
import { UserRoles } from '@prisma/client';

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
});
