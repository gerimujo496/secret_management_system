import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfirmEmailDto } from '../auth/dto/confirm-email.dto';

import { JsonValue } from '@prisma/client/runtime/library';
import { ErrorDal } from '../../common/dal/error.dal';

@Injectable()
export class UserDal {
  constructor(
    private prisma: PrismaService,
    private errorDal: ErrorDal,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.create({ data: createUserDto });
    } catch (error) {
      this.errorDal.handleError(error);
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: email, deletedAt: null },
      });

      return user;
    } catch (error) {
      this.errorDal.handleError(error);
    }
  }

  async getAllUsers() {
    try {
      return await this.prisma.user.findMany({ where: { deletedAt: null } });
    } catch (error) {
      this.errorDal.handleError(error);
    }
  }

  async findOneById(id: number) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: id, deletedAt: null },
      });

      return user;
    } catch (error) {
      this.errorDal.handleError(error);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto | ConfirmEmailDto) {
    try {
      const results = await this.prisma.user.update({
        where: { id, deletedAt: null },
        data: updateUserDto,
      });

      return results;
    } catch (error) {
      this.errorDal.handleError(error);
    }
  }

  async resetPassword(id: number, password: string) {
    try {
      const results = await this.prisma.user.update({
        where: { id, deletedAt: null },
        data: { password },
      });

      return results;
    } catch (error) {
      this.errorDal.handleError(error);
    }
  }

  async delete(id: number) {
    try {
      const results = await this.prisma.user.delete({
        where: { id, deletedAt: null },
      });

      return results;
    } catch (error) {
      this.errorDal.handleError(error);
    }
  }

  async setSecretKey(id: number, key: JsonValue) {
    try {
      const result = await this.prisma.user.update({
        where: { id },
        data: { twoFactorAuthenticationSecret: key },
      });

      return result;
    } catch (error) {
      this.errorDal.handleError(error);
    }
  }

  async activate2Fa(id: number) {
    try {
      const result = await this.prisma.user.update({
        where: { id },
        data: { isTwoFactorAuthenticationEnabled: true },
      });

      return result;
    } catch (error) {
      this.errorDal.handleError(error);
    }
  }
}
