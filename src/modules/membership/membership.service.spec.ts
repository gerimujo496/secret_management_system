import { Test, TestingModule } from '@nestjs/testing';
import { MembershipService } from './membership.service';
import { MembershipDAL } from './dal/membership.dal';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';
import { UserDal } from '../user/user.dal';
import { BadRequestException } from '@nestjs/common';
import { errorMessage } from '../../constants/error-messages';
import { UserRoles } from '@prisma/client';

const myMemberships = {
  membershipsList: [
    {
      id: 2,
      userId: 2,
      firstName: 'Akeron',
      lastName: 'Allkushi',
      role: UserRoles.EDITOR,
      accountId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

const notAdminMembership = {
  id: 1,
  accountId: 2,
  userId: 2,
  roleId: 2,
  isConfirmed: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
const deletedMembership = {
  id: 1,
  accountId: 2,
  userId: 2,
  roleId: 2,
  isConfirmed: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: new Date(),
};

const adminMembership = {
  id: 1,
  role: { roleName: UserRoles.ADMIN },
};

const user = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'securePassword123',
  confirmationToken: 'dnjscnas2132on3doeo323',
  isConfirmed: true,
  twoFactorAuthenticationSecret: null,
  isTwoFactorAuthenticationEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('MembershipService', () => {
  let membershipService: MembershipService;
  let emailService: EmailService;
  let authService: AuthService;
  let membershipDAL: MembershipDAL;
  let userDAL: UserDal;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        {
          provide: MembershipDAL,
          useValue: {
            findAccountMemberships: jest.fn(),
            findNotAdminMembership: jest.fn(),
            findRoleRecord: jest.fn(),
            updateUserRole: jest.fn(),
            findMembership: jest.fn(),
            deleteMembership: jest.fn(),
            findExisitingMembership: jest.fn(),
            findExistingInvitation: jest.fn(),
            createMembership: jest.fn(),
            updateMembership: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendInvitationForAccountMembership: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            updateConfirmationTokenAndReturnNewUser: jest.fn(),
            getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists:
              jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: UserDal,
          useValue: {
            findOneById: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    membershipService = module.get<MembershipService>(MembershipService);
    emailService = module.get<EmailService>(EmailService);
    authService = module.get<AuthService>(AuthService);
    membershipDAL = module.get<MembershipDAL>(MembershipDAL);
    userDAL = module.get<UserDal>(UserDal);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(membershipService).toBeDefined();
  });

  it('should not get account memberships if no accoundId', async () => {
    await expect(
      membershipService.getAccountMemberships(undefined),
    ).rejects.toThrow(
      new BadRequestException(errorMessage.ID_REQUIRED('Account ID')),
    );
  });

  it('should get all accounts', async () => {
    jest
      .spyOn(membershipDAL, 'findAccountMemberships')
      .mockResolvedValue(myMemberships);

    const result = await membershipDAL.findAccountMemberships(2);

    expect(result).toEqual(myMemberships);
  });

  it('should not update user role if no accountId', async () => {
    await expect(
      membershipService.updateUserRole({
        accountId: undefined,
        userId: 1,
        role: 'Editor',
      }),
    ).rejects.toThrow(
      new BadRequestException(
        errorMessage.BOTH_REQUIRED('User ID', 'Account ID'),
      ),
    );
  });

  it('should not update user role if no userId', async () => {
    await expect(
      membershipService.updateUserRole({
        accountId: 2,
        userId: undefined,
        role: 'Editor',
      }),
    ).rejects.toThrow(
      new BadRequestException(
        errorMessage.BOTH_REQUIRED('User ID', 'Account ID'),
      ),
    );
  });

  it('should not update user role if new role is invalid', async () => {
    await expect(
      membershipService.updateUserRole({
        accountId: 2,
        userId: 2,
        role: 'Test',
      }),
    ).rejects.toThrow(new BadRequestException(errorMessage.INVALID_ROLE));
  });

  it('should not update user role if role is admin', async () => {
    jest.spyOn(membershipDAL, 'findNotAdminMembership').mockResolvedValue(null);

    await expect(
      membershipService.updateUserRole({
        accountId: 2,
        userId: 2,
        role: 'Editor',
      }),
    ).rejects.toThrow(
      new BadRequestException(errorMessage.INVALID_ENTITY('membership')),
    );
  });

  it('should not update user role if role not found', async () => {
    jest
      .spyOn(membershipDAL, 'findNotAdminMembership')
      .mockResolvedValue(notAdminMembership);
    jest.spyOn(membershipDAL, 'findRoleRecord').mockResolvedValue(null);

    await expect(
      membershipService.updateUserRole({
        accountId: 2,
        userId: 2,
        role: 'Editor',
      }),
    ).rejects.toThrow(
      new BadRequestException(errorMessage.INVALID_ENTITY('role')),
    );
  });

  it('should update user role', async () => {
    jest
      .spyOn(membershipDAL, 'findNotAdminMembership')
      .mockResolvedValue(notAdminMembership);
    jest.spyOn(membershipDAL, 'findRoleRecord').mockResolvedValue({ id: 1 });
    jest
      .spyOn(membershipDAL, 'updateUserRole')
      .mockResolvedValue({ ...notAdminMembership, roleId: 2 });

    const result = await membershipDAL.updateUserRole(notAdminMembership.id, 2);

    expect(result).toEqual({ ...notAdminMembership, roleId: 2 });
  });

  it('should not delete membership if no accountId', async () => {
    await expect(
      membershipService.deleteMembership(1, undefined),
    ).rejects.toThrow(
      new BadRequestException(
        errorMessage.BOTH_REQUIRED('Membership ID', 'Account ID'),
      ),
    );
  });

  it('should not delete membership if no membershipId', async () => {
    await expect(
      membershipService.deleteMembership(undefined, 1),
    ).rejects.toThrow(
      new BadRequestException(
        errorMessage.BOTH_REQUIRED('Membership ID', 'Account ID'),
      ),
    );
  });

  it('should not delete membership if no membership found', async () => {
    jest.spyOn(membershipDAL, 'findMembership').mockResolvedValue(null);

    await expect(membershipService.deleteMembership(1, 1)).rejects.toThrow(
      new BadRequestException(errorMessage.INVALID_ENTITY('membership')),
    );
  });

  it('should not delete membership if it is an admin membership', async () => {
    jest
      .spyOn(membershipDAL, 'findMembership')
      .mockResolvedValue(adminMembership);

    await expect(membershipService.deleteMembership(1, 1)).rejects.toThrow(
      new BadRequestException(errorMessage.FORBIDDEN_ACCESS),
    );
  });

  it('should delete membership', async () => {
    jest
      .spyOn(membershipDAL, 'findMembership')
      .mockResolvedValue({ id: 1, role: { roleName: UserRoles.EDITOR } });

    jest
      .spyOn(membershipDAL, 'deleteMembership')
      .mockResolvedValue(deletedMembership);

    const result = await membershipDAL.deleteMembership(1);

    expect(result).toEqual(deletedMembership);
  });

  it('should not invite user if no accountId', async () => {
    await expect(
      membershipService.inviteUser(undefined, 'oniakeron@gmail.com', 1),
    ).rejects.toThrow(
      new BadRequestException(
        errorMessage.BOTH_REQUIRED('Account ID', 'User ID'),
      ),
    );
  });

  it('should not invite user if role viewer not found', async () => {
    jest.spyOn(membershipDAL, 'findRoleRecord').mockResolvedValue(null);

    await expect(
      membershipService.inviteUser(2, 'oniakeron@gmail.com', 1),
    ).rejects.toThrow(new BadRequestException(errorMessage.INVALID_ROLE));
  });

  it('should not send invitation if it already has one', async () => {
    jest.spyOn(membershipDAL, 'findRoleRecord').mockResolvedValue({ id: 1 });
    jest.spyOn(userDAL, 'findByEmail').mockResolvedValue(user);
    jest
      .spyOn(membershipDAL, 'findExisitingMembership')
      .mockResolvedValue(notAdminMembership);

    await expect(
      membershipService.inviteUser(1, 'oniakeron@gmail.com', 1),
    ).rejects.toThrow(new BadRequestException(errorMessage.MEMBERSHIP_EXISTS));
  });

  it('should create membership if the user does not have one', async () => {
    jest.spyOn(membershipDAL, 'findRoleRecord').mockResolvedValue({ id: 1 });
    jest.spyOn(userDAL, 'findByEmail').mockResolvedValue(user);
    jest
      .spyOn(membershipDAL, 'findExisitingMembership')
      .mockResolvedValue(null);
    jest
      .spyOn(membershipDAL, 'createMembership')
      .mockResolvedValue(notAdminMembership);

    const result = await membershipDAL.createMembership({
      accountId: 1,
      userId: 1,
      roleId: 1,
    });

    expect(result).toEqual(notAdminMembership);
  });

  it('should send email invitation', async () => {
    const admin = { firstName: 'John', lastName: 'Doe' };

    jest.spyOn(membershipDAL, 'findRoleRecord').mockResolvedValue({ id: 1 });
    jest.spyOn(userDAL, 'findByEmail').mockResolvedValue(user);
    jest
      .spyOn(membershipDAL, 'findExisitingMembership')
      .mockResolvedValue(null);
    jest
      .spyOn(membershipDAL, 'createMembership')
      .mockResolvedValue(notAdminMembership);
    jest.spyOn(userDAL, 'findOneById').mockResolvedValue(user);
    jest
      .spyOn(authService, 'updateConfirmationTokenAndReturnNewUser')
      .mockResolvedValue(user);

    jest.spyOn(membershipDAL, 'findExistingInvitation').mockResolvedValue(null);
    jest
      .spyOn(emailService, 'sendInvitationForAccountMembership')
      .mockResolvedValue();

    const result = await membershipService.inviteUser(
      1,
      'oniakeron@gmail.com',
      1,
    );

    expect(result).toEqual(
      `Your invitation to ${user.email} was successfully sent.`,
    );

    expect(
      emailService.sendInvitationForAccountMembership,
    ).toHaveBeenCalledWith({
      sender: admin,
      recipient: user.email,
      membershipId: notAdminMembership.id,
      confirmationToken: expect.any(String),
    });
  });

  it('should send invitation for unregistered user', async () => {
    const accountId = 1;
    const roleViewerRecordId = 2;
    const admin = { firstName: 'Akeron', lastName: 'Allkushi' };
    const email = 'test@example.com';

    jest
      .spyOn(membershipDAL, 'createMembership')
      .mockResolvedValue(notAdminMembership);
    jest
      .spyOn(emailService, 'sendInvitationForAccountMembership')
      .mockResolvedValue();

    const result = await membershipService.inviteUnregisteredUser({
      accountId,
      roleViewerRecordId,
      admin,
      email,
    });

    expect(result).toEqual(
      `Your invitation to ${email} was successfully sent.`,
    );
    expect(membershipDAL.createMembership).toHaveBeenCalledWith({
      accountId,
      roleId: roleViewerRecordId,
    });
    expect(
      emailService.sendInvitationForAccountMembership,
    ).toHaveBeenCalledWith({
      sender: admin,
      recipient: email,
      membershipId: 1,
    });
  });

  it('should return registration view details', async () => {
    const email = 'test@example.com';
    const membershipId = '12345';

    const result = await membershipService.registerAndCreate(
      email,
      membershipId,
    );

    expect(result).toEqual({
      view: 'signup',
      email,
      prefix: 'membership',
      path: 'register/confirm',
      membershipId,
    });
  });

  it('should not confirm invitation if no membershipId', async () => {
    await expect(
      membershipService.confirmInvitation(undefined, 'tokenTest'),
    ).rejects.toThrow(
      new BadRequestException(
        errorMessage.BOTH_REQUIRED('Membership Id', 'Token'),
      ),
    );
  });

  it('should not confirm invitation if no token', async () => {
    await expect(
      membershipService.confirmInvitation(1, undefined),
    ).rejects.toThrow(
      new BadRequestException(
        errorMessage.BOTH_REQUIRED('Membership Id', 'Token'),
      ),
    );
  });

  it('should register and confirm invitation successfully', async () => {
    const body = { email: 'test.user@example.com', password: 'securePassword' };
    const membershipId = 1;
    const token = 'validToken';

    jest.spyOn(authService, 'createUser').mockResolvedValue(token);
    jest
      .spyOn(
        authService,
        'getUserFromTokenOrThrowErrorIfTokenIsNotValidOrUserDoNotExists',
      )
      .mockResolvedValue(user);
    jest
      .spyOn(membershipDAL, 'updateMembership')
      .mockResolvedValue(notAdminMembership);

    const result = await membershipService.registerAndConfirmInvitation(
      body,
      membershipId,
    );

    expect(result).toEqual({
      view: 'index',
      title: 'Your invitation was accepted',
      message: 'Welcome to the club.',
    });
  });

  it('should handle error when sending invitation to unregistered user fails', async () => {
    const accountId = 1;
    const roleViewerRecordId = 2;
    const admin = { firstName: 'Akeron', lastName: 'Allkushi' };
    const email = 'unregistered@example.com';

    jest
      .spyOn(membershipDAL, 'createMembership')
      .mockResolvedValue(notAdminMembership);
    jest
      .spyOn(emailService, 'sendInvitationForAccountMembership')
      .mockRejectedValue(new Error('Email sending failed'));

    await expect(
      membershipService.inviteUnregisteredUser({
        accountId,
        roleViewerRecordId,
        admin,
        email,
      }),
    ).rejects.toThrow('Email sending failed');
  });
});
