import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { UserRoles } from '@prisma/client';
import { UpdateAccountDto } from '../dtos/update-account.dto';
import { ErrorDal } from 'src/common/dal/error.dal';

@Injectable()
export class AccountDAL {
  constructor(
    private prisma: PrismaService,
    private errorDAL: ErrorDal,
  ) {}

  async findUserById(userId: number) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId, isConfirmed: true, deletedAt: null },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async findMembership(accountId: number, userId: number) {
    try {
      const membership = await this.prisma.membership.findFirst({
        where: {
          accountId,
          userId,
          isConfirmed: true,
          deletedAt: null,
        },
      });

      return membership;
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async findAllMembershipsForAccount(accountId: number) {
    try {
      const memberships = await this.prisma.membership.findMany({
        where: { accountId, isConfirmed: true, deletedAt: null },
      });

      return memberships;
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async findAccount(accountId: number) {
    try {
      const account = await this.prisma.account.findFirst({
        where: { id: accountId, deletedAt: null },
      });

      return account;
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async findUsersMembershipsByAccount(accountId: number) {
    try {
      const memberships = await this.prisma.membership.findMany({
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

      if (memberships.length === 0) {
        return { users: [] };
      }

      const usersList = memberships.map((membership) => ({
        roleName: membership.role.roleName,
        userId: membership.user.id,
        userFirstName: membership.user.firstName,
        userLastName: membership.user.lastName,
        userEmail: membership.user.email,
      }));

      return { usersList };
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async createMembershipAndAccount(
    data: CreateAccountDto,
    userId: number,
    password: string,
  ) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const createdAccount = await prisma.account.create({
          data: { ...data, password },
        });

        const roleRecord = await prisma.role.findFirst({
          where: { roleName: UserRoles.ADMIN },
        });

        const createdMembership = await prisma.membership.create({
          data: {
            userId,
            accountId: createdAccount.id,
            roleId: roleRecord.id,
            isConfirmed: true,
          },
        });

        return [createdAccount, createdMembership];
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async updateAccount(
    accoundId: number,
    newAccountInformation: UpdateAccountDto,
  ) {
    try {
      const updatedAccount = await this.prisma.account.update({
        where: { id: accoundId, deletedAt: null },
        data: { ...newAccountInformation },
      });

      return updatedAccount;
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async deleteMembershipsAndAccount(accountId: number) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const deletedMemberships = await prisma.membership.deleteMany({
          where: { accountId, deletedAt: null },
        });

        const deletedAccount = await prisma.account.delete({
          where: { id: accountId, deletedAt: null },
        });

        return [deletedAccount, deletedMemberships];
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }
}
