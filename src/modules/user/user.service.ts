import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDal } from './user.dal';

@Injectable()
export class UserService {
  constructor(private userDal: UserDal) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const { firstName, lastName, email, password } = createUserDto;

      const createdUser = await this.userDal.create({
        firstName,
        lastName,
        email,
        password,
      } as CreateUserDto);

      return createdUser;
    } catch (error) {}
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
