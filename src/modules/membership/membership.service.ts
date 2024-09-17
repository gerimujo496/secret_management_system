import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { MembershipDAL } from './dal/membership.dal';
import { errorMessage } from '../../constants/error-messages';

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
}
