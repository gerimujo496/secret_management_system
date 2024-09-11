import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SecretsDAL } from './secrets.dal';
import { CreateSecretsDto } from './dtos/create-secrets.dto';
import { UpdateSecretsDto } from './dtos/update-Secrets.dto';

@Injectable()
export class SecretsService {
  constructor(private readonly secretsDAL: SecretsDAL) {}

  async createSecret(createSecretDto: CreateSecretsDto, accountId: number) {
    try {
      const createdSecret = await this.secretsDAL.createSecret(
        createSecretDto,
        accountId,
      );
      if (!createdSecret) {
        throw new InternalServerErrorException('Failed to create secret.');
      }
      return createdSecret;
    } catch {
      throw new BadRequestException('Could not create secret');
    }
  }

  async findAllSecretsByAccount(accountId: number) {
    try {
      const secrets = await this.secretsDAL.findAllSecrets(accountId);
      if (secrets.length === 0) {
        throw new NotFoundException('No secrets found for this account.');
      }
      return secrets;
    } catch {
      throw new InternalServerErrorException('Failed to retrieve secrets.');
    }
  }

  async findSecretByIdAndAccount(accountId: number, secretId: number) {
    try {
      const secret = await this.secretsDAL.findSecretById(secretId, accountId);
      if (!secret) {
        throw new NotFoundException(
          'Secret not found or does not belong to this account.',
        );
      }
      return secret;
    } catch {
      throw new InternalServerErrorException('Failed to retrieve secret.');
    }
  }

  async updateSecret(
    accountId: number,
    secretId: number,
    updateSecretDto: UpdateSecretsDto,
  ) {
    try {
      const secret = await this.findSecretByIdAndAccount(accountId, secretId);
      if (!secret) {
        throw new NotFoundException('Secret not found for this account.');
      }
      return await this.secretsDAL.updateSecret(
        secretId,
        updateSecretDto,
        accountId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update secret.');
    }
  }

  async deleteSecret(accountId: number, secretId: number) {
    try {
      const secret = await this.findSecretByIdAndAccount(accountId, secretId);
      if (!secret) {
        throw new NotFoundException('Secret not found for this account.');
      }

      return await this.secretsDAL.deleteSecret(secretId, accountId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete secret.');
    }
  }
}
