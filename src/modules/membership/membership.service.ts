import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { MembershipDAL } from './dal/membership.dal';
import { errorMessage } from '../../constants/error-messages';
import { EmailService } from '../email/email.service';
import { AuthService } from '../auth/auth.service';
import { UserDal } from '../user/user.dal';

@Injectable()
export class MembershipService {
  constructor(
    private membershipDAL: MembershipDAL,
    private emailService: EmailService,
    private authService: AuthService,
    private userDal: UserDal,
  ) {}

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

  async inviteUser(accountId: number, email: string, adminId: number) {
    if (!accountId)
      throw new BadRequestException(
        errorMessage.BOTH_REQUIRED('Account ID', 'User ID'),
      );

    const roleViewerRecord = await this.membershipDAL.findRoleRecord(
      UserRoles.VIEWER,
    );

    if (!roleViewerRecord) {
      throw new BadRequestException(errorMessage.INVALID_ROLE);
    }

    const user = await this.userDal.findByEmail(email);

    const admin = await this.userDal.findOneById(adminId);

    if (!user) {
      this.inviteUnregisteredUser({
        accountId,
        user,
        email,
        roleViewerRecordId: roleViewerRecord.id,
        admin,
      });
    }

    const existingMembership = await this.membershipDAL.findExisitingMembership(
      user.id,
      accountId,
    );

    if (existingMembership) {
      throw new BadRequestException(errorMessage.MEMBERSHIP_EXISTS);
    }
    const existingInvitation = await this.membershipDAL.findExistingInvitation(
      user.id,
      accountId,
    );

    if (existingInvitation) {
      throw new BadRequestException(errorMessage.INVITATION_EXISTS);
    }

    const { confirmationToken } =
      await this.authService.updateConfirmationTokenAndReturnNewUser(user);

    const newMembershipData = {
      accountId,
      userId: user.id,
      roleId: roleViewerRecord.id,
    };

    const newMembership =
      await this.membershipDAL.createMembership(newMembershipData);

    await this.emailService.sendInvitationForAccountMembership({
      sender: { firstName: admin.firstName, lastName: admin.lastName },
      recipient: user.email,
      membershipId: newMembership.id,
      confirmationToken,
    });

    return `Your invitation to ${user.email} was successfully sent.`;
  }

  async inviteUnregisteredUser({
    accountId,
    roleViewerRecordId,
    admin,
    email,
    user,
  }) {
    const newMembershipData = {
      accountId,
      roleId: roleViewerRecordId,
    };

    const newMembership =
      await this.membershipDAL.createMembership(newMembershipData);

    await this.emailService.sendInvitationForAccountMembership({
      sender: { firstName: admin.firstName, lastName: admin.lastName },
      recipient: email,
      membershipId: newMembership.id,
    });

    return `Your invitation to ${user.email} was successfully sent.`;
  }

  async registerAndCreate(email: string, membershipId: string) {
    return {
      view: 'signup',
      email,
      prefix: 'membership',
      path: 'register/confirm',
      membershipId,
    };
  }

  async registerAndConfirmInvitation(body: any, membershipId: number) {
    const confirmationToken = await this.authService.createUser(body);

    if (!confirmationToken) {
      return {
        view: 'index',
        title: 'Your invitation was NOT accepted',
        message: 'Something went wrong',
        src: 'https://pngfre.com/wp-content/uploads/sad-emoji-png-image-from-pngfre-2-284x300.png',
      };
    }

    const user =
      await this.authService.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
        confirmationToken,
      );

    await this.membershipDAL.updateMembership(membershipId, user.id);

    return {
      view: 'index',
      title: 'Your invitation was accepted',
      message: 'Welcome to the club.',
    };
  }

  async updateTest(id: number, userId: number) {
    return await this.membershipDAL.updateMembership(id, userId);
  }

  async confirmInvitation(membershipId: number, token: string) {
    if (!membershipId || !token)
      throw new BadRequestException(
        errorMessage.BOTH_REQUIRED('Membership Id', 'Token'),
      );

    const user =
      await this.authService.getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists(
        token,
      );

    const unconfirmedInvitation =
      await this.membershipDAL.findUnconfirmedInvitation(membershipId, user.id);

    if (!unconfirmedInvitation) {
      throw new BadRequestException(errorMessage.INVITATION_NOT_FOUND);
    }

    await this.membershipDAL.acceptInvitation(unconfirmedInvitation.id);

    return {
      view: 'index',
      title: 'Invitation accepted.',
      message: `Your membership invitatation was successfully accepted.`,
    };
  }
}
