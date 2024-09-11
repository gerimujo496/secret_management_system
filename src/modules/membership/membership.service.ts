import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { AccountDal } from '../account/account.dal';
import { PrismaService } from '../prisma/prisma.service';

interface UpdateMembership {
  accountId: number;
  adminId: number;
  userId: number;
  role: string;
}

interface DeleteMembership {
  accountId: number;
  membershipId: number;
  userId: number;
}

@Injectable()
export class MembershipService {
  constructor(
    private prisma: PrismaService,
    private accountDal: AccountDal,
  ) {}

  async updateUserRole({ accountId, adminId, userId, role }: UpdateMembership) {
    try {
      if (!userId || !accountId || !adminId) return null;

      const roleUpperCase = role.toUpperCase();

      if (
        roleUpperCase !== UserRoles.EDITOR &&
        roleUpperCase !== UserRoles.VIEWER
      ) {
        return new BadRequestException('Bad Request.');
      }

      const adminAccount = await this.accountDal.findAdminAccount(
        accountId,
        adminId,
      );

      if (!adminAccount) {
        throw new ForbiddenException('Forbidden access.');
      }

      const membership = await this.prisma.membership.findFirst({
        where: {
          accountId,
          userId,
          deletedAt: null,
          role: { roleName: { not: UserRoles.ADMIN } },
        },
        select: {
          id: true,
          userId: true,
          role: {
            select: {
              roleName: true,
            },
          },
        },
      });

      if (!membership) {
        throw new BadRequestException('Membership not found.');
      }

      const roleRecord = await this.prisma.role.findFirst({
        where: { roleName: roleUpperCase },
        select: {
          id: true,
        },
      });

      const updateUserRole = this.prisma.membership.update({
        where: { id: membership.id },
        data: {
          roleId: roleRecord.id,
        },
      });

      return updateUserRole;
    } catch (error) {
      return new Error(error.message);
    }
  }

  async deleteMembership({
    membershipId,
    accountId,
    userId,
  }: DeleteMembership) {
    try {
      if (!membershipId || !accountId || !userId) return null;

      const adminAccount = await this.accountDal.findAdminAccount(
        accountId,
        userId,
      );

      if (!adminAccount) {
        throw new ForbiddenException('Forbidden access.');
      }

      const membership = await this.prisma.membership.findFirst({
        where: { id: membershipId, deletedAt: null },
        select: {
          id: true,
          role: {
            select: {
              roleName: true,
            },
          },
        },
      });

      if (!membership) {
        throw new NotFoundException('Membership not found.');
      }

      if (membership.role.roleName === UserRoles.ADMIN) {
        throw new ForbiddenException('Forbidden access.');
      }

      return await this.prisma.membership.delete({
        where: { id: membership.id },
      });
    } catch (error) {
      return new Error(error.message);
    }
  }
}
