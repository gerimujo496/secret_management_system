import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dtos/create-account.dto';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from '@prisma/client';
import { controller_path } from '../../constants/controller-path';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../passport/jwt/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(controller_path.ACCOUNT.PATH)
@ApiTags(controller_path.ACCOUNT.PATH)
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get(controller_path.ACCOUNT.MY_ACCOUNTS)
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR, UserRoles.VIEWER)
  getAccounts(@Request() req: any) {
    return this.accountService.getAccounts(req.user?.id);
  }

  @Post()
  createAccount(@Body() body: CreateAccountDto, @Request() req: any) {
    return this.accountService.createAccount(body, req.user?.id);
  }

  @Get(controller_path.ACCOUNT.GET_ONE)
  @Roles(UserRoles.ADMIN)
  getMyAccount(@Param('accountId') accountId: string, @Request() req: any) {
    return this.accountService.getMyAccount(req.user?.id, parseInt(accountId));
  }

  @Get(controller_path.ACCOUNT.GET_USERS)
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR, UserRoles.VIEWER)
  getAccountUsers(@Param('accountId') accountId: string) {
    return this.accountService.getAccountUsers(parseInt(accountId));
  }

  @Patch(controller_path.ACCOUNT.UPDATE_ACCOUNT)
  @Roles(UserRoles.ADMIN)
  updateAccount(
    @Param('accountId') accountId: string,
    @Body() body: UpdateAccountDto,
  ) {
    return this.accountService.updateAccount(parseInt(accountId), body);
  }

  @Delete(controller_path.ACCOUNT.DELETE_ACCOUNT)
  @Roles(UserRoles.ADMIN)
  deleteAccount(@Param('accountId') accountId: string) {
    return this.accountService.deleteAccount(parseInt(accountId));
  }
}
