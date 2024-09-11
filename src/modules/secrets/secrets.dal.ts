import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSecretsDto } from './dtos/create-Secrets.dto';
import { UpdateSecretsDto } from './dtos/update-Secrets.dto';

@Injectable()
export class SecretsDAL {
  constructor(private readonly prisma: PrismaService) {}

  async createSecret(createSecretDto: CreateSecretsDto, accountId: number) {

   
    return await this.prisma.secret.create({
        
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
    const secret = await this.findSecretById(id, accountId);
    if (!secret) throw new Error('Secret not found for this account');

    return await this.prisma.secret.update({
      where: { id },
      data: updateSecretDto,
    });
  }

  async deleteSecret(id: number, accountId: number) {
    const secret = await this.findSecretById(id, accountId);
    if (!secret) {
      throw new Error(
        'Secret not found for this account or it has already been deleted',
      );
    }
    return await this.prisma.secret.delete({
      where: { id },
    });
  }
}
