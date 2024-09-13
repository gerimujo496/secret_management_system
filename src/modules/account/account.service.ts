import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountDto } from './dtos/create-account.dto';
import { generate } from 'generate-password';
import { UserRoles } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async createAccount(data: CreateAccountDto, userId: number) {
    try {
      if (!userId) return null;

      if (Object.keys(data).length === 0) {
        throw new BadRequestException('No data provided.');
      }

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
      return new ExceptionsHandler(error.response);
    }
  }

  async getMyAccount(userId: number, accountId: number) {
    try {
      if (!userId || !accountId) return null;

      const membership = await this.prisma.membership.findFirst({
        where: {
          accountId,
          userId,
          isConfirmed: true,
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
      return new ExceptionsHandler(error.response);
    }
  }

  async getAccountUsers(accountId: number) {
    try {
      if (!accountId) return null;

      const usersList = await this.prisma.membership.findMany({
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

      return usersList || [];
    } catch (error) {
      return new ExceptionsHandler(error.response);
    }
  }

  async updateAccount(
    accountId: number,
    newAccountInformation: UpdateAccountDto,
  ) {
    try {
      if (!accountId) return null;

      if (Object.keys(newAccountInformation).length === 0) {
        throw new BadRequestException('No data provided.');
      }

      const currentAccount = await this.prisma.account.findFirst({
        where: { id: accountId, deletedAt: null },
      });

      if (!currentAccount) {
        throw new BadRequestException('Bad request.');
      }

      return await this.prisma.account.update({
        where: { id: currentAccount.id },
        data: { ...newAccountInformation },
      });
    } catch (error) {
      return new ExceptionsHandler(error.response);
    }
  }

  async deleteAccount(accountId: number) {
    try {
      if (!accountId) return null;

      const memberships = await this.prisma.membership.findMany({
        where: { accountId, isConfirmed: true, deletedAt: null },
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
      return new ExceptionsHandler(error.response);
    }
  }
}
