import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SecretsDAL } from './secrets.dal';
import { AccountDAL } from '../account/account.dal';
import { CreateSecretsDto } from './dtos/createSecrets.dto';
import { UpdateSecretsDto } from './dtos/updateSecrets.dto';
import { encrypt, decrypt } from '../../common/utils/encrypt';

@Injectable()
export class SecretsService {
  constructor(
    private readonly secretsDAL: SecretsDAL,
    private readonly accountsDAL: AccountDAL,
  ) {}

  async createSecret(createSecretDto: CreateSecretsDto, accountId: number) {
    const account = await this.accountsDAL.findAccountById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    const encryptedValue = encrypt(createSecretDto.value, account.password);

    const createdSecret = await this.secretsDAL.createSecret(
      { ...createSecretDto, value: encryptedValue },
      accountId,
    );
    if (!createdSecret) {
      throw new BadRequestException('Failed to create secret.');
    }
    return createdSecret;
  }

  async findAllSecretsByAccount(accountId: number) {
    const secrets = await this.secretsDAL.findAllSecrets(accountId);

    if (secrets.length === 0) {
      throw new NotFoundException('No secrets found for this account.');
    }

    const account = await this.accountsDAL.findAccountById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    const decryptedSecrets = secrets.map((secret) => {
      const decryptedValue = decrypt(secret.value, account.password);
      return { ...secret, value: decryptedValue };
    });
    return decryptedSecrets;
  }

  async findSecretByIdAndAccount(accountId: number, secretId: number) {
    const secret = await this.secretsDAL.findSecretById(secretId, accountId);
    if (!secret) {
      throw new NotFoundException(
        'Secret not found or does not belong to this account.',
      );
    }
    const account = await this.accountsDAL.findAccountById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found.');
    }
    const decryptedValue = decrypt(secret.value, account.password);
    return { ...secret, value: decryptedValue };
  }

  async updateSecret(
    accountId: number,
    secretId: number,
    updateSecretDto: UpdateSecretsDto,
  ) {
    const secret = await this.findSecretByIdAndAccount(accountId, secretId);
    if (!secret) {
      throw new NotFoundException('Secret not found for this account.');
    }
    const account = await this.accountsDAL.findAccountById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found.');
    }
    if (updateSecretDto.value) {
      updateSecretDto.value = encrypt(updateSecretDto.value, account.password);
    }
    return await this.secretsDAL.updateSecret(
      secretId,
      updateSecretDto,
      accountId,
    );
  }

  async deleteSecret(accountId: number, secretId: number) {
    const secret = await this.findSecretByIdAndAccount(accountId, secretId);
    if (!secret) {
      throw new NotFoundException('Secret not found for this account.');
    }

    return await this.secretsDAL.deleteSecret(secretId, accountId);
  }
}
