// import { Test, TestingModule } from '@nestjs/testing';
// import { PrismaService } from '../prisma/prisma.service';
// import { ErrorDal } from '../../common/dal/error.dal';
// import { MembershipController } from './membership.controller';
// import { MembershipService } from './membership.service';
// import { MembershipDAL } from './dal/membership.dal';
// import { EmailService } from '../email/email.service';
// import { AuthService } from '../auth/auth.service';
// import { UserDal } from '../user/user.dal';

// class MockSendgridClient {}
// class MockConfigService {
//   get(key: string) {
//     return 'mock-value'; // Return a mock value as needed
//   }
// }

// describe('MembershipController', () => {
//   let membershipController: MembershipController;
//   let membershipService: MembershipService;
//   let emailService: EmailService;
//   let authService: AuthService;
//   let membershipDAL: MembershipDAL;
//   let errorDAL: ErrorDal;
//   let userDAL: UserDal;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [MembershipController],
//       providers: [
//         MembershipService,
//         PrismaService,
//         MembershipDAL,
//         ErrorDal,
//         EmailService,
//         AuthService,
//         UserDal,
//         { provide: 'SendgridClient', useClass: MockSendgridClient },
//         { provide: 'ConfigService', useClass: MockConfigService }, // Mock ConfigService
//       ],
//     }).compile();

//     membershipController =
//       module.get<MembershipController>(MembershipController);
//     membershipService = module.get<MembershipService>(MembershipService);
//     emailService = module.get<EmailService>(EmailService);
//     authService = module.get<AuthService>(AuthService);
//     membershipDAL = module.get<MembershipDAL>(MembershipDAL);
//     errorDAL = module.get<ErrorDal>(ErrorDal);
//     userDAL = module.get<UserDal>(UserDal); // Get userDal
//   });

//   it('should be defined', () => {
//     expect(membershipController).toBeDefined();
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { MembershipDAL } from './dal/membership.dal';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorDal } from '../../common/dal/error.dal'; // Import ErrorDal
import { EmailService } from '../email/email.service'; // Mock if needed
import { AuthService } from '../auth/auth.service'; // Mock if needed
import { CreateInvitationDTO } from './dtos/create-invitation.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { CreateUserDto } from '../auth/dto/create-user.dto';

describe('MembershipController', () => {
  let membershipController: MembershipController;
  let membershipService: MembershipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipController],
      providers: [
        {
          provide: MembershipService,
          useValue: {
            registerAndCreate: jest.fn(),
            registerAndConfirmInvitation: jest.fn(),
            confirmInvitation: jest.fn(),
            getAccountMemberships: jest.fn(),
            inviteUser: jest.fn(),
            updateUserRole: jest.fn(),
            deleteMembership: jest.fn(),
          },
        },
        {
          provide: MembershipDAL,
          useValue: {},
        },
        {
          provide: ErrorDal,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    }).compile();

    membershipController =
      module.get<MembershipController>(MembershipController);

    membershipService = module.get<MembershipService>(MembershipService);
  });

  it('should be defined', () => {
    expect(membershipController).toBeDefined();
  });

  it('should register and create membershipService.registerAndCreate', async () => {
    const query = { email: 'oniakeron@gmail.com', membershipId: 2 };

    jest
      .spyOn(membershipService, 'registerAndCreate')
      .mockResolvedValue(undefined);

    await membershipController.registerAndCreate(query);

    expect(membershipService.registerAndCreate).toHaveBeenCalledWith(
      query.email,
      query.membershipId,
    );
  });

  it('should register and confirm invitation membershipService.registerAndConfirmInvitation', async () => {
    const query = { membershipId: 2 };
    const body = {
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
    } as CreateUserDto;

    jest
      .spyOn(membershipService, 'registerAndConfirmInvitation')
      .mockResolvedValue(undefined);

    await membershipController.registerAndConfirmInvitation(body, query);

    expect(membershipService.registerAndConfirmInvitation).toHaveBeenCalledWith(
      body,
      query.membershipId,
    );
  });

  it('should get accounts memberships and call membershipService.getAccountMemberships', async () => {
    const accountId = 1;

    jest
      .spyOn(membershipService, 'getAccountMemberships')
      .mockResolvedValue(undefined);

    await membershipController.getAccountMemberships(accountId.toString());

    expect(membershipService.getAccountMemberships).toHaveBeenCalledWith(
      accountId,
    );
  });

  it('should invite user and call membershipService.inviteUser', async () => {
    const accountId = 1;
    const req = { user: { id: 1 } };
    const invitationEmail = {
      email: 'oniakeron@gmail.com',
    } as CreateInvitationDTO;

    jest
      .spyOn(membershipService, 'getAccountMemberships')
      .mockResolvedValue(undefined);

    await membershipController.inviteUser(
      accountId.toString(),
      req,
      invitationEmail,
    );

    expect(membershipService.inviteUser).toHaveBeenCalledWith(
      accountId,
      invitationEmail.email,
      req.user.id,
    );
  });

  it('should update user role and call membershipService.updateUserRole', async () => {
    const accountId = 2;
    const userId = 1;
    const role = {
      role: 'Editor',
    } as UpdateRoleDto;

    jest
      .spyOn(membershipService, 'updateUserRole')
      .mockResolvedValue(undefined);

    await membershipController.updateUserRole(
      userId.toString(),
      accountId.toString(),
      role,
    );

    expect(membershipService.updateUserRole).toHaveBeenCalledWith({
      userId: userId,
      accountId: accountId,
      role: role.role,
    });
  });

  it('should delete membership and call membershipService.deleteMembership', async () => {
    const accountId = 2;
    const membershipId = 1;

    jest
      .spyOn(membershipService, 'updateUserRole')
      .mockResolvedValue(undefined);

    await membershipController.deleteMembership(
      membershipId.toString(),
      accountId.toString(),
    );

    expect(membershipService.deleteMembership).toHaveBeenCalledWith(
      membershipId,
      accountId,
    );
  });
});
