import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class MembershipDAL{
    constructor(private readonly prisma: PrismaService) {}


    async findMembershipByUserId(userId: number){
        return await this.prisma.membership.findFirst({
          where: {
            userId: userId,
            deletedAt: null, // In case you want to filter out soft-deleted records
          },
          include: {
            account: true, // To get the associated account details
          },
        });
      }

   
}