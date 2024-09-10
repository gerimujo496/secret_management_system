import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Render,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { controller } from '../../constants/controller';
import { controller_path } from '../../constants/controllerPath';
import { CreateUserDto } from './dto/create-user.dto';

@Controller(controller.AUTH)
@ApiTags(controller.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(controller_path.AUTH.SIGN_UP)
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.createUser(createAuthDto);
  }

  @Get(controller_path.AUTH.CONFIRM_EMAIL)
  @Render('index')
  async findAll(@Query('token') token: string) {
    return await this.authService.confirmEmail(token);
  }

  @Get(':id')
  @Render('index')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }
}
