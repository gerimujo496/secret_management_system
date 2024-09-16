import { Test, TestingModule } from '@nestjs/testing';
import { SecretSharingService } from './secret-sharing.service';
import { AccountDAL } from '../account/account.dal';
import { SecretsDAL } from '../secrets/secrets.dal';
import { SecretSharingDAL } from './secret-sharing.dal';
import { EmailService } from '../email/email.service';
import { UserDal } from '../user/user.dal';
import { MembershipDAL } from '../membership/membership.dal';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('SecretSharingService', () => {
  let service: SecretSharingService;
  let accountDAL: AccountDAL;
  let secretsDAL: SecretsDAL;
  let secretSharingDAL: SecretSharingDAL;
  let emailService: EmailService;
  let usersDAL: UserDal;
  let membershipDAL: MembershipDAL;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretSharingService,
        { provide: AccountDAL, useValue: { findAccountById: jest.fn() } },
        { provide: SecretsDAL, useValue: { findSecretById: jest.fn() } },
        { provide: SecretSharingDAL, useValue: { createSecret: jest.fn(), findSecretShareById: jest.fn(), updateSecretSharing: jest.fn() } },
        { provide: EmailService, useValue: { sendVerificationCodeEmail: jest.fn(), secretSharingEmail: jest.fn() } },
        { provide: UserDal, useValue: { findByEmail: jest.fn() } },
        { provide: MembershipDAL, useValue: { findMembershipByUserId: jest.fn() } },
      ],
    }).compile();

    service = module.get<SecretSharingService>(SecretSharingService);
    accountDAL = module.get<AccountDAL>(AccountDAL);
    secretsDAL = module.get<SecretsDAL>(SecretsDAL);
    secretSharingDAL = module.get<SecretSharingDAL>(SecretSharingDAL);
    emailService = module.get<EmailService>(EmailService);
    usersDAL = module.get<UserDal>(UserDal);
    membershipDAL = module.get<MembershipDAL>(MembershipDAL);
  });
  const account = {
    id: 1,
    name: 'Test Account',
    description: 'Test Description',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  const expirationTimeString = "2024-12-31T23:59:59.999Z";
  const expirationTime = new Date(expirationTimeString);
  describe('genereateKey', () => {
    it('should throw NotFoundException if account does not exist', async () => {
      jest.spyOn(accountDAL, 'findAccountById').mockResolvedValue(null);

      await expect(service.genereateKey(1)).rejects.toThrow(NotFoundException);
    });

    it('should return a generated key if account exists', async () => {
      jest.spyOn(accountDAL, 'findAccountById').mockResolvedValue(account);
      jest.spyOn(service, 'genereateKey').mockResolvedValue('mockGeneratedKey');

      const result = await service.genereateKey(1);
      expect(result).toEqual('mockGeneratedKey');
    });
  });

  describe('shareSecret', () => {
    it('should throw NotFoundException if receiver user is not found', async () => {
      jest.spyOn(usersDAL, 'findByEmail').mockResolvedValue(null);
     
      await expect(
        service.shareSecret({
          receiverEmail: 'test@test.com', secretId: 1,
          expirationTime: expirationTime,
          numberOfTries: 2,
          passcode: 2
        }, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if secret is not found', async () => {
      jest.spyOn(accountDAL, 'findAccountById').mockResolvedValue(account);
      jest.spyOn(usersDAL, 'findByEmail').mockResolvedValue({id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        confirmationToken: 'someToken',
        isConfirmed: true,
        is2FaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null });
      jest.spyOn(secretsDAL, 'findSecretById').mockResolvedValue(null);

      await expect(
        service.shareSecret({
          receiverEmail: 'john.doe@example.com', secretId: 1,
          expirationTime: expirationTime,
          numberOfTries: 2,
          passcode: 2
        }, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should share the secret successfully', async () => {
      const secret = { id: 1, name: 'Test Secret',value: 'secret value', description:'test description',createdAt:new Date() , updatedAt: new Date(), deletedAt: null};
      jest.spyOn(accountDAL, 'findAccountById').mockResolvedValue(account);
      jest.spyOn(usersDAL, 'findByEmail').mockResolvedValue({ id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        confirmationToken: 'someToken',
        isConfirmed: true,
        is2FaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null  });
      jest.spyOn(secretsDAL, 'findSecretById').mockResolvedValue(secret);
      jest.spyOn(secretSharingDAL, 'createSecret').mockResolvedValue({ id: 1,
        expirationTime: new Date(),
        accountGiverId: 1,
        accountReceiverId: 1,
        numberOfTries: 3,
        passcode: 123456,
        isAccepted: false,
        secretId: 789});
      jest.spyOn(emailService, 'secretSharingEmail').mockResolvedValue(Promise.resolve());

      const result = await service.shareSecret(
        {
          receiverEmail: 'test@test.com', secretId: 1,
          expirationTime: expirationTime,
          numberOfTries: 2,
          passcode: 2
        }, 1
      );

      expect(result).toEqual({ id: 1 });
      expect(emailService.secretSharingEmail).toHaveBeenCalled();
    });
  });

});
