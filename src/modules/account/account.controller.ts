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
import { AuthGuard } from '../../common/guards/auth.guard';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { controller_path } from '../../constants/controller-path';

@Controller(controller_path.ACCOUNT.PATH)
@UseGuards(AuthGuard)
@UseGuards(RolesGuard)
export class AccountController {
  constructor(private accountService: AccountService) {}

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
