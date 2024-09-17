import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { MembershipDAL } from './dal/membership.dal';
import { errorMessage } from 'src/constants/error-messages';

@Injectable()
export class MembershipService {
  constructor(private membershipDAL: MembershipDAL) {}

  async updateUserRole({ accountId, userId, role }: UpdateMembership) {
    if (!userId || !accountId)
      throw new BadRequestException(
        errorMessage.BOTH_REQUIRED('User ID', 'Account ID'),
      );

    const roleUpperCase = role.toUpperCase();

    if (
      roleUpperCase !== UserRoles.EDITOR &&
      roleUpperCase !== UserRoles.VIEWER
    ) {
      return new BadRequestException(errorMessage.INVALID_ROLE);
    }

    const notAdminMembership = await this.membershipDAL.findNotAdminMembership(
      accountId,
      userId,
    );

    if (!notAdminMembership) {
      throw new NotFoundException(errorMessage.INVALID_ENTITY('membership'));
    }

    const roleRecord = await this.membershipDAL.findRoleRecord(roleUpperCase);

    if (!roleRecord) {
      throw new NotFoundException(errorMessage.INVALID_ENTITY('role'));
    }

    const updatedMembership = await this.membershipDAL.updateUserRole(
      notAdminMembership.id,
      roleRecord.id,
    );

    return updatedMembership;
  }

  async deleteMembership(membershipId: number, accountId: number) {
    if (!membershipId || !accountId)
      throw new BadRequestException(
        errorMessage.BOTH_REQUIRED('Membership ID', 'Account ID'),
      );

    const membership = await this.membershipDAL.findMembership(
      membershipId,
      accountId,
    );

    if (!membership) {
      throw new NotFoundException(errorMessage.INVALID_ENTITY('membership'));
    }

    if (membership.role.roleName === UserRoles.ADMIN) {
      throw new ForbiddenException(errorMessage.FORBIDDEN_ACCESS);
    }

    return await this.membershipDAL.deleteMembership(membership.id);
  }

  // async inviteUser(accountId: number, userId: number, adminId: number) {
  //   if (!accountId || !userId) return null;

  //   const baseUrl = this.configService.get<string>('INVITATION_URL');
  //   if (!baseUrl) {
  //     throw new Error('Base URL for invitations is not configured.');
  //   }

  //   const adminID = adminId ? adminId : 2;

  //   const admin = await this.prisma.membership.findFirst({
  //     where: {
  //       userId: adminID,
  //       accountId,
  //       isConfirmed: true,
  //       role: { roleName: UserRoles.ADMIN },
  //     },
  //     select: {
  //       user: {
  //         select: {
  //           firstName: true,
  //           lastName: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!admin) {
  //     throw new BadRequestException('Admin not found or not authorized.');
  //   }

  //   const roleViewerRecord = await this.prisma.role.findFirst({
  //     where: { roleName: UserRoles.VIEWER },
  //   });

  //   if (!roleViewerRecord) {
  //     throw new BadRequestException('Viewer role not found.');
  //   }

  //   const user = await this.prisma.user.findFirst({
  //     where: { id: userId, isConfirmed: true },
  //   });

  //   if (!user) {
  //     throw new NotFoundException('User not found.');
  //   }

  //   const existingMembership = await this.prisma.membership.findFirst({
  //     where: { userId, accountId, isConfirmed: true, deletedAt: null },
  //   });

  //   if (existingMembership) {
  //     throw new BadRequestException(
  //       'User already has a membership for this account.',
  //     );
  //   }

  //   const existingInvitation = await this.prisma.membership.findFirst({
  //     where: { userId, accountId, isConfirmed: null },
  //   });

  //   if (existingInvitation) {
  //     throw new BadRequestException(
  //       'User already has an invitation to your account.',
  //     );
  //   }

  //   const newMembershipData = {
  //     accountId,
  //     userId,
  //     roleId: roleViewerRecord.id,
  //   };

  //   const newMembership = await this.prisma.membership.create({
  //     data: newMembershipData,
  //   });

  //   const invitationUrl = `${baseUrl}?membershipId=${newMembership.id}`;

  //   await this.emailService.sendInvitationForAccountMembership({
  //     sender: admin.user,
  //     recipient: user.email,
  //     url: invitationUrl,
  //   });

  //   return {
  //     view: 'index',
  //     data: {
  //       title: 'Invitation accepted.',
  //       message: `Your membership invitatation to the account of ${admin.user.firstName} ${admin.user.lastName} was successfully accepted.`,
  //     },
  //   };
  // }

  // async confirmInvitation(membershipId: number) {
  //   try {
  //     if (!membershipId) return null;

  //     const membership = await this.prisma.membership.findFirst({
  //       where: { id: membershipId, isConfirmed: null },
  //     });

  //     if (!membership) {
  //       throw new BadRequestException(
  //         'Invitation not found or already confirmed.',
  //       );
  //     }

  //     await this.prisma.membership.update({
  //       where: { id: membershipId },
  //       data: { isConfirmed: true },
  //     });

  //     return 'Membership invitation Confirmed';
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'An error occurred while confirming the invitation.',
  //     );
  //   }
  // }
}
