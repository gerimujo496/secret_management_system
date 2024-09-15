import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSecretSharingDto } from './dtos/create-secretSharing.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SecretShare } from '@prisma/client';

@Injectable()
export class SecretSharingDAL {
  constructor(private readonly prisma: PrismaService) {}

  async createSecret(
    createSecretSharingDto: CreateSecretSharingDto,
    accountGiverId: number,
  ) {
    const receiverAccount = await this.prisma.user.findFirst({
      where: {
        email: createSecretSharingDto.receiverEmail,
      },
    });

    if (!receiverAccount) {
      throw new Error('Receiver account not found.');
    }

    return await this.prisma.secretShare.create({
      data: {
        expirationTime: createSecretSharingDto.expirationTime,
        numberOfTries: createSecretSharingDto.numberOfTries,
        passcode: null,
        isAccepted: false,
        secret: {
          connect: { id: createSecretSharingDto.secretId },
        },
        accountReceiver: {
          connect: { id: receiverAccount.id },
        },
        accountGiver: {
          connect: { id: accountGiverId },
        },
      },
    });
  }

  async findSecretShareById(secretShareId: number) {
    return this.prisma.secretShare.findFirst({
      where: { id: secretShareId },
    });
  }

  async decrementTries(secretShareId: number) {
    return this.prisma.secretShare.update({
      where: { id: secretShareId },
      data: { numberOfTries: { decrement: 1 } },
    });
  }

  async markAsAccepted(secretShareId: number) {
    return this.prisma.secretShare.update({
      where: { id: secretShareId },
      data: { isAccepted: true },
    });
  }

  async addSecretToAccount(accountId: number, secretId: number) {
    return this.prisma.accountSecret.create({
      data: {
        accountId,
        secretId,
      },
    });
  }
  async updateSecretSharing(
    secretShareId: number,
    updateData: Partial<SecretShare>,
  ): Promise<SecretShare> {
    try {
      const updatedSecretShare = await this.prisma.secretShare.update({
        where: { id: secretShareId },
        data: updateData,
      });
      return updatedSecretShare;
    } catch (error) {
      throw new Error(`Error updating secret share record: ${error.message}`);
    }
  }
}
