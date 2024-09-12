import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async updateUserRole({ accountId, userId, role }: UpdateMembership) {
    try {
      if (!userId || !accountId) return null;

      const roleUpperCase = role.toUpperCase();

      if (
        roleUpperCase !== UserRoles.EDITOR &&
        roleUpperCase !== UserRoles.VIEWER
      ) {
        return new BadRequestException('Bad Request.');
      }

      const membership = await this.prisma.membership.findFirst({
        where: {
          accountId,
          userId,
          deletedAt: null,
          isConfirmed: true,
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
        throw new BadRequestException('Bad request.');
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
      return new ExceptionsHandler(error.response);
    }
  }

  async deleteMembership(membershipId: number, accountId: number) {
    try {
      if (!membershipId || !accountId) return null;

      const membership = await this.prisma.membership.findFirst({
        where: {
          id: membershipId,
          isConfirmed: true,
          deletedAt: null,
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
        throw new NotFoundException('Membership not found.');
      }

      if (membership.role.roleName === UserRoles.ADMIN) {
        throw new ForbiddenException('Forbidden access.');
      }

      return await this.prisma.membership.delete({
        where: { id: membership.id },
      });
    } catch (error) {
      return new ExceptionsHandler(error.response);
    }
  }
}
