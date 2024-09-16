import { Test, TestingModule } from '@nestjs/testing';
import { SecretSharingService } from './secret-sharing.service';
import { SecretSharingDAL } from './secret-sharing.dal';
import { AccountDAL } from '../account/account.dal';
import { CreateSecretSharingDto} from './dtos/create-secretSharing.dto';
import * as encryptUtils from '../../common/utils/encrypt';
import {BadRequestException,NotFoundException,
} from '@nestjs/common';
import { AcceptSecretDto } from './dtos/accept-secret.dto';

jest.mock('../../common/utils/encrypt', () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

describe('SecretSharingService', () => {
  let service: SecretSharingService;
  let secretsDAL: SecretSharingDAL;
  let accountDAL: AccountDAL;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretsService,
        {
          provide: SecretsDAL,
          useValue: {
            createSecret: jest.fn(),
            findAllSecrets: jest.fn(),
            findSecretById: jest.fn(),
            updateSecret: jest.fn(),
            deleteSecret: jest.fn(),
          },
        },
        { provide: AccountDAL, useValue: { findAccountById: jest.fn() } },
      ],
    }).compile();

    service = module.get<SecretsService>(SecretsService);
    secretsDAL = module.get<SecretsDAL>(SecretsDAL);
    accountDAL = module.get<AccountDAL>(AccountDAL);
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
  const createSecretDto: CreateSecretsDto = {
    name: 'API KEY',
    value: 'secretValue',
    description: 'API key for an endpoint',
  };
  const encryptedValue = 'encryptedValue';
  const createdSecret = {
    id: 1,
    ...createSecretDto,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    value: encryptedValue,
  };
  const secret = {
    id: 1,
    value: 'encryptedValue',
    name: 'Test Secret',
    description: 'Test Description',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  const decryptedValue = 'decryptedValue';
  describe('createSecret', () => {
    it('should create a secret successfully', async () => {
      jest.spyOn(accountDAL, 'findAccountById').mockResolvedValue(account);
      jest.spyOn(secretsDAL, 'createSecret').mockResolvedValue(createdSecret);
      jest.spyOn(encryptUtils, 'encrypt').mockReturnValue('encryptedValue');

      const result = await service.createSecret(createSecretDto, account.id);

      expect(accountDAL.findAccountById).toHaveBeenCalledWith(account.id);
      expect(encryptUtils.encrypt).toHaveBeenCalledWith(
        createSecretDto.value,
        account.password,
      );
      expect(secretsDAL.createSecret).toHaveBeenCalledWith(
        { ...createSecretDto, value: encryptedValue },
        account.id,
      );
      expect(result).toEqual(createdSecret);
    });
    it('should throw a NotFoundException when account is not found', async () => {
      jest.spyOn(accountDAL, 'findAccountById').mockResolvedValue(null);

      await expect(
        service.createSecret({} as CreateSecretsDto, 1),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw a BadRequestException on secret creation failure', async () => {
      jest.spyOn(accountDAL, 'findAccountById').mockResolvedValue(account);
      jest.spyOn(secretsDAL, 'createSecret').mockResolvedValue(null);

      await expect(
        service.createSecret({} as CreateSecretsDto, 1),
      ).rejects.toThrow(BadRequestException);
    });
  })})