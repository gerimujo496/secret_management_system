import { Test, TestingModule } from '@nestjs/testing';
import { SecretsService } from './secrets.service';
import { SecretDAL } from './secret.dal';
import { AccountDAL } from '../account/dal/account.dal';
import { CreateSecretsDto } from './dtos/createSecrets.dto';
import * as encryptUtils from '../../common/utils/encrypt';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSecretsDto } from './dtos/updateSecrets.dto';

jest.mock('../../common/utils/encrypt', () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

describe('SecretsService', () => {
  let service: SecretsService;
  let secretsDAL: SecretDAL;
  let accountDAL: AccountDAL;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretsService,
        {
          provide: SecretDAL,
          useValue: {
            createSecret: jest.fn(),
            findAllSecrets: jest.fn(),
            findSecretById: jest.fn(),
            updateSecret: jest.fn(),
            deleteSecret: jest.fn(),
          },
        },
        { provide: AccountDAL, useValue: { findAccount: jest.fn() } },
      ],
    }).compile();

    service = module.get<SecretsService>(SecretsService);
    secretsDAL = module.get<SecretDAL>(SecretDAL);
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
      jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(account);
      jest.spyOn(secretsDAL, 'createSecret').mockResolvedValue(createdSecret);
      jest.spyOn(encryptUtils, 'encrypt').mockReturnValue('encryptedValue');

      const result = await service.createSecret(createSecretDto, account.id);

      expect(accountDAL.findAccount).toHaveBeenCalledWith(account.id);
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
      jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(null);

      await expect(
        service.createSecret({} as CreateSecretsDto, 1),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw a BadRequestException on secret creation failure', async () => {
      jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(account);
      jest.spyOn(secretsDAL, 'createSecret').mockResolvedValue(null);

      await expect(
        service.createSecret({} as CreateSecretsDto, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });
  describe('findAllSecretsByAccount', () => {
    const secrets = [
      {
        id: 1,
        value: 'encryptedValue',
        name: 'Test Secret',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];
    it('should return decrypted secrets for an account', async () => {
      jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(account);
      jest.spyOn(secretsDAL, 'findAllSecrets').mockResolvedValue(secrets);
      jest.spyOn(encryptUtils, 'decrypt').mockReturnValue(decryptedValue);

      const result = await service.findAllSecretsByAccount(account.id);

      expect(secretsDAL.findAllSecrets).toHaveBeenCalledWith(account.id);
      expect(encryptUtils.decrypt).toHaveBeenCalledWith(
        'encryptedValue',
        account.password,
      );
      expect(result).toEqual([{ ...secrets[0], value: decryptedValue }]);
    });
    it('should throw a NotFoundException when account is not found', async () => {
      jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(null);

      await expect(
        service.createSecret({} as CreateSecretsDto, 1),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw NotFoundException when no secrets are found', async () => {
      jest.spyOn(secretsDAL, 'findAllSecrets').mockResolvedValue([]);

      await expect(service.findAllSecretsByAccount(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('findSecretByIdAndAccount', () => {
    it('should get a descypered secret for an account by its id', async () => {
      jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(account);
      jest.spyOn(secretsDAL, 'findSecretById').mockResolvedValue(secret);
      jest.spyOn(encryptUtils, 'decrypt').mockReturnValue(decryptedValue);

      const result = await service.findSecretByIdAndAccount(
        account.id,
        secret.id,
      );
      expect(secretsDAL.findSecretById).toHaveBeenCalledWith(
        secret.id,
        account.id,
      );
      expect(encryptUtils.decrypt).toHaveBeenCalledWith(
        'encryptedValue',
        account.password,
      );
      expect(result).toEqual({ ...secret, value: decryptedValue });
    });
  });

  describe('updateSecret', () => {
    it('should update a secret successfully with encrypted value', async () => {
      const updateSecretDto: UpdateSecretsDto = { value: 'newSecretValue' };
      const encryptedValue = 'encryptedNewValue';

      jest.spyOn(service, 'findSecretByIdAndAccount').mockResolvedValue(secret);
      jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(account);
      jest.spyOn(encryptUtils, 'encrypt').mockReturnValue(encryptedValue);
      jest
        .spyOn(secretsDAL, 'updateSecret')
        .mockResolvedValue({ ...secret, value: encryptedValue });

      const result = await service.updateSecret(
        account.id,
        secret.id,
        updateSecretDto,
      );

      expect(encryptUtils.encrypt).toHaveBeenCalledWith(
        'newSecretValue',
        account.password,
      );
      expect(secretsDAL.updateSecret).toHaveBeenCalledWith(
        secret.id,
        { ...updateSecretDto, value: encryptedValue },
        account.id,
      );
      expect(result).toEqual({ ...secret, value: encryptedValue });
    });

    it('should throw a NotFoundException when account is not found', async () => {
      jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(null);

      await expect(
        service.createSecret({} as CreateSecretsDto, 1),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw NotFoundException when no secret is found', async () => {
      jest.spyOn(secretsDAL, 'findAllSecrets').mockResolvedValue([]);

      await expect(service.findAllSecretsByAccount(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('deleteSecret', () => {
    it('should delete a secret successfully', async () => {
      jest.spyOn(service, 'findSecretByIdAndAccount').mockResolvedValue(secret);
      jest.spyOn(secretsDAL, 'deleteSecret').mockResolvedValue(secret);

      const result = await service.deleteSecret(1, 1);

      expect(secretsDAL.deleteSecret).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(secret);
    });
    it('should throw a NotFoundException when account is not found', async () => {
      jest.spyOn(accountDAL, 'findAccount').mockResolvedValue(null);

      await expect(
        service.createSecret({} as CreateSecretsDto, 1),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw NotFoundException when secret is not found', async () => {
      jest.spyOn(service, 'findSecretByIdAndAccount').mockResolvedValue(null);

      await expect(service.deleteSecret(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
