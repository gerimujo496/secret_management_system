import { Injectable } from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountDal {
  constructor(private prisma: PrismaService) {}

  async findAdminAccount(accountId: number, adminId: number) {
    return await this.prisma.membership.findFirst({
      where: {
        accountId,
        userId: adminId,
        role: {
          roleName: UserRoles.ADMIN,
        },
        deletedAt: null,
      },
    });
  }

  async findAccount(accountId: number) {
    return await this.prisma.account.findFirst({
      where: { id: accountId, deletedAt: null },
    });
  }
}
