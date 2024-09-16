import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { MembershipDAL } from './dal/membership.dal';

@Injectable()
export class MembershipService {
  constructor(private membershipDAL: MembershipDAL) {}

  async updateUserRole({ accountId, userId, role }: UpdateMembership) {
    if (!userId || !accountId)
      throw new BadRequestException(
        'User ID and Account ID are both required.',
      );

    const roleUpperCase = role.toUpperCase();

    if (
      roleUpperCase !== UserRoles.EDITOR &&
      roleUpperCase !== UserRoles.VIEWER
    ) {
      return new BadRequestException('Please assign a valid new role.');
    }

    const membership = await this.membershipDAL.findNotAdminMembership(
      accountId,
      userId,
    );

    const roleRecord = await this.membershipDAL.findRoleRecord(roleUpperCase);

    const updatedMembership = await this.membershipDAL.updateUserRole(
      membership.id,
      roleRecord.id,
    );

    return updatedMembership;
  }

  async deleteMembership(membershipId: number, accountId: number) {
    if (!membershipId || !accountId)
      throw new BadRequestException(
        'Membership ID and Account ID are both required.',
      );

    const membership = await this.membershipDAL.findMembership(
      membershipId,
      accountId,
    );

    if (membership.role.roleName === UserRoles.ADMIN) {
      throw new ForbiddenException('Forbidden access.');
    }

    return await this.membershipDAL.deleteMembership(membership.id);
  }
}
