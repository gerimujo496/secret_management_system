import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MembershipService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

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

  async inviteUser(accountId: number, userId: number, adminId: number) {
    if (!accountId || !userId) return null;

    const baseUrl = this.configService.get<string>('INVITATION_URL');
    if (!baseUrl) {
      throw new Error('Base URL for invitations is not configured.');
    }

    const adminID = adminId ? adminId : 2;

    const admin = await this.prisma.membership.findFirst({
      where: {
        userId: adminID,
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

    if (!admin) {
      throw new BadRequestException('Admin not found or not authorized.');
    }

    const roleViewerRecord = await this.prisma.role.findFirst({
      where: { roleName: UserRoles.VIEWER },
    });

    if (!roleViewerRecord) {
      throw new BadRequestException('Viewer role not found.');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, isConfirmed: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const existingMembership = await this.prisma.membership.findFirst({
      where: { userId, accountId, isConfirmed: true, deletedAt: null },
    });

    if (existingMembership) {
      throw new BadRequestException(
        'User already has a membership for this account.',
      );
    }

    const existingInvitation = await this.prisma.membership.findFirst({
      where: { userId, accountId, isConfirmed: null },
    });

    if (existingInvitation) {
      throw new BadRequestException(
        'User already has an invitation to your account.',
      );
    }

    const newMembershipData = {
      accountId,
      userId,
      roleId: roleViewerRecord.id,
    };

    const newMembership = await this.prisma.membership.create({
      data: newMembershipData,
    });

    const invitationUrl = `${baseUrl}?membershipId=${newMembership.id}`;

    await this.emailService.sendInvitationForAccountMembership({
      sender: admin.user,
      recipient: user.email,
      url: invitationUrl,
    });

    return {
      view: 'index',
      data: {
        title: 'Invitation accepted.',
        message: `Your membership invitatation to the account of ${admin.user.firstName} ${admin.user.lastName} was successfully accepted.`,
      },
    };
  }

  async confirmInvitation(membershipId: number) {
    try {
      if (!membershipId) return null;

      const membership = await this.prisma.membership.findFirst({
        where: { id: membershipId, isConfirmed: null },
      });

      if (!membership) {
        throw new BadRequestException(
          'Invitation not found or already confirmed.',
        );
      }

      await this.prisma.membership.update({
        where: { id: membershipId },
        data: { isConfirmed: true },
      });

      return 'Membership invitation Confirmed';
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while confirming the invitation.',
      );
    }
  }
}
