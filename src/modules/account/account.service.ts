import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateAccountDto } from './dtos/create-account.dto';
import { generate } from 'generate-password';
import { AccountDal } from './account.dal';
import { UserRoles } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAccountDto } from './dtos/update-account.dto';

interface UpdateAccount {
  accountId: number;
  userId: number;
  newAccountInformation: UpdateAccountDto;
}

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private accountDal: AccountDal,
  ) {}

  async createAccount(data: CreateAccountDto, userId: number) {
    try {
      const password = generate({
        length: 15,
        numbers: true,
      });

      const accountInformation = {
        ...data,
        password,
      };

      const account = await this.prisma.account.create({
        data: accountInformation,
      });

      const role = await this.prisma.role.findFirst({
        where: { roleName: UserRoles.ADMIN },
      });

      await this.prisma.membership.create({
        data: {
          userId,
          accountId: account.id,
          roleId: role.id,
          isConfirmed: true,
        },
      });

      return account;
    } catch (error) {
      return new Error(error.message);
    }
  }

  async getMyAccount(userId: number, accountId: number) {
    try {
      const membership = await this.prisma.membership.findFirst({
        where: {
          accountId,
          userId,
          role: { roleName: UserRoles.ADMIN },
          deletedAt: null,
        },
      });

      if (!membership) {
        throw new BadRequestException('Bad request.');
      }

      return await this.prisma.account.findFirst({
        where: { id: accountId },
      });
    } catch (error) {
      return new Error(error.message);
    }
  }

  async getAccountUsers(accountId: number, userId: number) {
    try {
      if (!accountId) return null;

      const accountAdmin = await this.accountDal.findAdminAccount(
        accountId,
        userId,
      );

      if (!accountAdmin) {
        throw new ForbiddenException('Forbidden access.');
      }

      const usersList = await this.prisma.membership.findMany({
        where: { accountId, deletedAt: null },
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

      return usersList || [];
    } catch (error) {
      return new Error(error.message);
    }
  }

  async updateAccount({
    accountId,
    newAccountInformation,
    userId,
  }: UpdateAccount) {
    if (!accountId) return null;

    if (Object.keys(newAccountInformation).length === 0) {
      throw new BadRequestException('No data provided.');
    }

    const accountAdmin = await this.accountDal.findAdminAccount(
      accountId,
      userId,
    );

    if (!accountAdmin) {
      throw new ForbiddenException('Forbidden access.');
    }

    const currentAccount = await this.accountDal.findAccount(accountId);

    if (!currentAccount) {
      throw new BadRequestException('Bad request.');
    }

    return await this.prisma.account.update({
      where: { id: currentAccount.id },
      data: { ...newAccountInformation },
    });
  }

  async deleteAccount(accountId: number, userId: number) {
    try {
      if (!accountId) return null;

      const adminMembership = await this.prisma.membership.findFirst({
        where: { accountId, userId, deletedAt: null },
      });

      if (!adminMembership) {
        throw new ForbiddenException('Forbidden access.');
      }

      const memberships = await this.prisma.membership.findMany({
        where: { accountId, deletedAt: null },
      });

      if (memberships.length === 0) {
        return memberships;
      }

      await this.prisma.membership.deleteMany({
        where: { accountId, deletedAt: null },
      });

      return await this.prisma.account.delete({
        where: { id: accountId, deletedAt: null },
      });
    } catch (error) {
      return new Error(error.message);
    }
  }
}
