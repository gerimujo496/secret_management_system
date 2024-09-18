import { PrismaService } from '../prisma/prisma.service';
import { CreateSecretSharingDto } from './dtos/create-secret-sharing.dto';
import { Injectable } from '@nestjs/common';
import { SecretShare } from '@prisma/client';
import { ErrorDal } from '../../common/dal/error.dal';
@Injectable()
export class SecretSharingDAL {
  constructor(
    private readonly prisma: PrismaService,
    private errorDAL: ErrorDal,
  ) {}
  async createSecretShare(
    createSecretSharingDto: CreateSecretSharingDto,
    accountGiverId: number,
  ) {
    const roles = await this.prisma.role.findFirst({
      where: { roleName: 'ADMIN' },
    });
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: createSecretSharingDto.receiverEmail,
        },
      });

      const userAccount = await this.prisma.membership.findFirst({
        where: {
          userId: user.id,
          roleId: roles.id,
        },
      });

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
            connect: { id: userAccount.accountId },
          },
          accountGiver: {
            connect: { id: accountGiverId },
          },
        },
      });
    } catch (error) {
      console.log(error);
      this.errorDAL.handleError(error);
    }
  }

  async findSecretShareById(secretShareId: number) {
    try {
      const secretShare = await this.prisma.secretShare.findFirst({
        where: { id: secretShareId },
      });

      return secretShare;
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async decrementTries(secretShareId: number) {
    try {
      return this.prisma.secretShare.update({
        where: { id: secretShareId },
        data: { numberOfTries: { decrement: 1 } },
      });
    } catch (error) {
      console.log(error);
      this.errorDAL.handleError(error);
    }
  }

  async markAsAccepted(secretShareId: number) {
    try {
      return this.prisma.secretShare.update({
        where: { id: secretShareId },
        data: { isAccepted: true },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
    try {
      return this.prisma.secretShare.update({
        where: { id: secretShareId },
        data: { isAccepted: true },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
  }

  async addSecretToAccount(accountId: number, secretId: number) {
    try {
      return this.prisma.accountSecret.create({
        data: {
          accountId,
          secretId,
        },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
    try {
      return this.prisma.accountSecret.create({
        data: {
          accountId,
          secretId,
        },
      });
    } catch (error) {
      this.errorDAL.handleError(error);
    }
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
      this.errorDAL.handleError(error);
      this.errorDAL.handleError(error);
    }
  }
}
