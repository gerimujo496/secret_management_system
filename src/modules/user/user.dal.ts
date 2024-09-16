import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { errorMessage } from '../../constants/error-messages';
import { Entities } from '../../constants/entities';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserDal {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.create({ data: createUserDto });
    } catch (_error) {
      throw new HttpException(
        errorMessage.INTERNAL_SERVER_ERROR('create', Entities.USER),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: email, deletedAt: null },
      });

      return user;
    } catch (_error) {
      throw new HttpException(
        errorMessage.INTERNAL_SERVER_ERROR('get by email', Entities.USER),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUsers() {
    try {
      return await this.prisma.user.findMany({ where: { deletedAt: null } });
    } catch (_error) {
      throw new HttpException(
        errorMessage.INTERNAL_SERVER_ERROR('get all', Entities.USER),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(id: number) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: id, deletedAt: null },
      });

      return user;
    } catch (_error) {
      throw new HttpException(
        errorMessage.INTERNAL_SERVER_ERROR('find', Entities.USER),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto | ConfirmEmailDto) {
    try {
      const results = await this.prisma.user.update({
        where: { id, deletedAt: null },
        data: updateUserDto,
      });

      return results;
    } catch (_error) {
      throw new HttpException(
        errorMessage.INTERNAL_SERVER_ERROR('update', Entities.USER),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(id: number, password: string) {
    try {
      const results = await this.prisma.user.update({
        where: { id, deletedAt: null },
        data: { password },
      });

      return results;
    } catch (_error) {
      throw new HttpException(
        errorMessage.INTERNAL_SERVER_ERROR('reset', Entities.USER),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: number) {
    try {
      const results = await this.prisma.user.delete({
        where: { id, deletedAt: null },
      });

      return results;
    } catch (_error) {
      throw new HttpException(
        errorMessage.INTERNAL_SERVER_ERROR('delete', Entities.USER),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
