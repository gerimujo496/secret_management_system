import { Injectable } from '@nestjs/common';

import { CreateSecretsDto } from './dtos/create-secrets.dto';
import { UpdateSecretsDto } from './dtos/update-secrets.dto';
import { ErrorDal } from '../../common/dal/error.dal';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecretsDAL {
  constructor(
    private readonly prisma: PrismaService,
    private errorDAL: ErrorDal,
  ) {}
  async createSecret(createSecretDto: CreateSecretsDto, accountId: number) {
    try {
      const secret = await this.prisma.secret.create({
        data: {
          name: createSecretDto.name,
          description: createSecretDto.description,
          value: createSecretDto.value,
          AccountSecret: {
            create: {
              accountId: accountId,
            },
          },
        },
      });
      return secret;
    } catch (error) {
      this.errorDAL.handleError(error);
    }
    try {
      const secret = await this.prisma.secret.create({
        data: {
          name: createSecretDto.name,
          description: createSecretDto.description,
          value: createSecretDto.value,
          AccountSecret: {
            create: {
              accountId: accountId,
            },
          },
        },
      });
      return secret;
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async findAllSecrets(accountId: number) {
    return await this.prisma.secret.findMany({
      where: {
        AccountSecret: {
          some: { accountId },
        },
        deletedAt: null,
      },
    });
  }

  async findSecretById(id: number, accountId: number) {
    return await this.prisma.secret.findFirst({
      where: {
        id,
        AccountSecret: {
          some: { accountId },
        },
        deletedAt: null,
      },
    });
  }

  async updateSecret(
    id: number,
    updateSecretDto: UpdateSecretsDto,
    accountId: number,
  ) {
    try {
      await this.findSecretById(id, accountId);

      return await this.prisma.secret.update({
        where: { id },
        data: updateSecretDto,
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
    return await this.prisma.secret.update({
      where: { id },
      data: updateSecretDto,
    });
  }
  catch(error) {
    this.errorDAL.handleError(error);
  }
  async deleteSecret(id: number, accountId: number) {
    try {
      await this.findSecretById(id, accountId);
      return await this.prisma.secret.delete({
        where: { id },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }
}
