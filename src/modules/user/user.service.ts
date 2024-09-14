import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDal } from './user.dal';
import { errorMessage } from '../../constants/error-messages';
import { Entities } from '../../constants/entities';

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

  async findOne(id: number) {
    const user = await this.userDal.findOneById(id);
    if (!user)
      throw new NotFoundException(errorMessage.NOT_FOUND(Entities.USER));

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.userDal.update(id, updateUserDto);

    if (!result)
      throw new NotFoundException(errorMessage.NOT_FOUND(Entities.USER));

    return result;
  }

  async remove(id: number) {
    const result = await this.userDal.delete(id);

    if (!result)
      throw new NotFoundException(errorMessage.NOT_FOUND(Entities.USER));

    return result;
  }
}
