import { PrismaService } from "src/prisma/prisma.service";
import { CreateSecretSharingDto } from "./dtos/create-secretSharing.dto";
import { Injectable, NotFoundException } from "@nestjs/common";


@Injectable()
export class SecretSharingDAL {
  constructor(private readonly prisma: PrismaService) {}

  async createSecret(createSecretSharingDto: CreateSecretSharingDto, accountGiverId: number) {

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
          connect: { id: createSecretSharingDto.accountReceiverId }, 
        },
        accountGiver: {
          connect: { id: accountGiverId },  
        },
      },
    });
  }
}


