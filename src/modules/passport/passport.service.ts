import { Injectable } from '@nestjs/common';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';

@Injectable()
export class PassportService {
  create(createPassportDto: CreatePassportDto) {
    return 'This action adds a new passport';
  }

  findAll() {
    return `This action returns all passport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} passport`;
  }

  update(id: number, updatePassportDto: UpdatePassportDto) {
    return `This action updates a #${id} passport`;
  }

  remove(id: number) {
    return `This action removes a #${id} passport`;
  }
}
