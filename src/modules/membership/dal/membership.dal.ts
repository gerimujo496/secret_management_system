import { Injectable } from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { ErrorDal } from '../../../common/dal/error.dal';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MembershipDAL {
  constructor(
    private prisma: PrismaService,
    private errorDAL: ErrorDal,
  ) {}

  async findUser(userId: number) {
    try {
      return await this.prisma.user.findFirst({
        where: { id: userId, isConfirmed: true, deletedAt: null },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async findExisitingMembership(userId: number, accountId: number) {
    try {
      return await this.prisma.membership.findFirst({
        where: { userId, accountId, isConfirmed: true, deletedAt: null },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async findUnconfirmedInvitation(membershipId: number, userId: number) {
    try {
      return await this.prisma.membership.findFirst({
        where: { id: membershipId, userId, isConfirmed: null, deletedAt: null },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async findExistingInvitation(userId: number, accountId: number) {
    try {
      return await this.prisma.membership.findFirst({
        where: { userId, accountId, isConfirmed: null },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async updateMembership(membershipId: number, userId: number) {
    try {
      return await this.prisma.membership.update({
        where: {
          id: membershipId,
          userId: null,
          deletedAt: null,
          isConfirmed: null,
        },
        data: { isConfirmed: true, userId: userId },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async findMembership(membershipId: number, accountId: number) {
    try {
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

      return membership;
    } catch (error) {
      this.errorDAL.handleError(error);
    }
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

      return notAdminMembership;
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async findAdminMembership(adminId: number, accountId: number) {
    try {
      return await this.prisma.membership.findFirst({
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
    } catch (error) {
      this.errorDAL.handleError(error);
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

  async createMembership(data: any) {
    try {
      return await this.prisma.membership.create({
        data: data,
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async acceptInvitation(id: number) {
    try {
      return await this.prisma.membership.update({
        where: { id, isConfirmed: null, deletedAt: null },
        data: { isConfirmed: true },
      });
    } catch (error) {}
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
