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
import { controller_path } from '../../constants/controller-path';
import { CreateUserDto } from './dto/create-user.dto';
import { LogInUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller(controller.AUTH)
@ApiTags(controller.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(controller_path.AUTH.SIGN_UP)
  async create(@Body() createAuthDto: CreateUserDto) {
    return await this.authService.createUser(createAuthDto);
  }

  @Post(controller_path.AUTH.SIGN_IN)
  login(@Body() loginUserDto: LogInUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get(controller_path.AUTH.CONFIRM_EMAIL)
  @Render('index')
  async confirmEmail(@Query('token') token: string) {
    return await this.authService.confirmEmail(token);
  }

  @Post(controller_path.AUTH.RESEND_EMAIL)
  resendEmail(@Query('token') token: string) {
    return this.authService.resendEmail(token);
  }

  @Post(controller_path.AUTH.REQUEST_RESET_PASSWORD)
  async requestToResetPassword(@Query('email') email: string) {
    return await this.authService.requestToResetPassword(email);
  }

  @Get(controller_path.AUTH.RESET_PASSWORD_FORM)
  @Render('reset-password.hbs')
  async resetForm(@Query('token') token: string) {
    return await this.authService.resetPasswordForm(token);
  }

  @Post(controller_path.AUTH.RESET_PASSWORD)
  @Render('reset-password-confirmation')
  async resetPassword(
    @Query('token') token: string,
    @Body() resetPassword: ResetPasswordDto,
  ) {
    return await this.authService.resetPassword(token, resetPassword);
  }
}
