import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SecretsDAL } from './secrets.dal';
import { AccountDAL } from '../account/dal/account.dal';
import { CreateSecretsDto } from './dtos/create-secrets.dto';
import { UpdateSecretsDto } from './dtos/update-secrets.dto';
import { encrypt, decrypt } from '../../common/utils/encrypt';
import { errorMessage } from '../../constants/error-messages';
@Injectable()
export class SecretsService {
  constructor(
    private readonly secretsDAL: SecretsDAL,
    private readonly accountsDAL: AccountDAL,
  ) {}

  async createSecret(createSecretDto: CreateSecretsDto, accountId: number) {
    const account = await this.accountsDAL.findAccount(accountId);
    if (!account) {
      throw new NotFoundException(errorMessage.NOT_FOUND('account'));
    }
    const encryptedValue = encrypt(createSecretDto.value, account.password);

    const createdSecret = await this.secretsDAL.createSecret(
      { ...createSecretDto, value: encryptedValue },
      accountId,
    );
    if (!createdSecret) {
      throw new BadRequestException(
        errorMessage.INTERNAL_SERVER_ERROR('create', 'secret'),
      );
    }
    return createdSecret;
  }

  async findAllSecretsByAccount(accountId: number) {
    const secrets = await this.secretsDAL.findAllSecrets(accountId);

    const account = await this.accountsDAL.findAccount(accountId);
    if (!account) {
      throw new NotFoundException(errorMessage.NOT_FOUND('account'));
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
      throw new NotFoundException(errorMessage.NOT_FOUND('secret'));
    }
    const account = await this.accountsDAL.findAccount(accountId);
    if (!account) {
      throw new NotFoundException(errorMessage.NOT_FOUND('account'));
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
      throw new NotFoundException(errorMessage.NOT_FOUND('secret'));
    }
    const account = await this.accountsDAL.findAccount(accountId);
    if (!account) {
      throw new NotFoundException(errorMessage.NOT_FOUND('account'));
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
      throw new NotFoundException(errorMessage.NOT_FOUND('secret'));
    }

    return await this.secretsDAL.deleteSecret(secretId, accountId);
  }
}
