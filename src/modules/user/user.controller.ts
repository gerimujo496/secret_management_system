import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { controller } from '../../constants/controller';
import { JwtAuthGuard } from '../passport/jwt/jwt-auth.guard';
import { User } from '../../common/customDecorators/user.decorator';
import { UserDal } from './user.dal';
import { SerializerInterceptor } from '../../common/interceptors/serialize.interceptors';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller(controller.USER)
@ApiBearerAuth()
@ApiTags(controller.USER)
@UseGuards(JwtAuthGuard)
@UseInterceptors(new SerializerInterceptor(UserDto))
export class UserController {
  constructor(
    private readonly userService: UserService,
    private userDal: UserDal,
  ) {}

  @Get()
  async findAll() {
    return await this.userDal.getAllUsers();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findOne(id);
  }

  @Patch()
  async update(
    @User() user: CreateUserDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(user.id, updateUserDto);
  }

  @Delete()
  async remove(@User() user: CreateUserDto) {
    return await this.userService.remove(user.id);
  }
}
