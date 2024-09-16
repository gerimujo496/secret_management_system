import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { ErrorDal } from 'src/common/dal/error.dal';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class MembershipDAL {
  constructor(
    private prisma: PrismaService,
    private errorDAL: ErrorDal,
  ) {}

  async findMembership(membershipId: number, accountId: number) {
    const membership = await this.prisma.membership.findFirst({
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

    if (!membership) {
      throw new NotFoundException(
        'Invalid membership or membership not found.',
      );
    }

    return membership;
  }

  async findNotAdminMembership(accountId: number, userId: number) {
    try {
      const notAdminMembership = await this.prisma.membership.findFirst({
        where: {
          accountId,
          userId,
          deletedAt: null,
          isConfirmed: true,
          role: { roleName: { not: UserRoles.ADMIN } },
        },
      });

      if (!notAdminMembership) {
        throw new NotFoundException(
          'Invalid membership or membership not found.',
        );
      }

      return notAdminMembership;
    } catch (error) {
      this.errorDAL.handleError(error, NotFoundException);
    }
  }

  async findRoleRecord(roleName: UserRoles) {
    try {
      const roleRecord = await this.prisma.role.findFirst({
        where: { roleName, deletedAt: null },
        select: {
          id: true,
        },
      });

      return roleRecord;
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async updateUserRole(membershipId: number, roleRecordId: number) {
    try {
      const updatedMembership = await this.prisma.membership.update({
        where: { id: membershipId, isConfirmed: true, deletedAt: null },
        data: {
          roleId: roleRecordId,
        },
      });

      return updatedMembership;
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async deleteMembership(membershipId: number) {
    try {
      return await this.prisma.membership.delete({
        where: { id: membershipId },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }
}
