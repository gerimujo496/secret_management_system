import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';

@Injectable()
export class UserDal {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({ data: createUserDto });
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email, deletedAt: null },
    });

    return user;
  }

  async getAllUsers() {
    return await this.prisma.user.findMany({ where: { deletedAt: null } });
  }

  async findOneById(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: id, deletedAt: null },
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto | ConfirmEmailDto) {
    const results = await this.prisma.user.update({
      where: { id, deletedAt: null },
      data: updateUserDto,
    });

    return results;
  }
  async delete(id: number) {
    const results = await this.prisma.user.delete({
      where: { id, deletedAt: null },
    });

    return results;
  }
}
