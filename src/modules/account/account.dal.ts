import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class AccountDAL{
    constructor(private readonly prisma: PrismaService) {}


    async findAccountById( accountId: number) {
        return await this.prisma.account.findFirst({
            where: { id: accountId, deletedAt: null },
        });
      }

   
}
