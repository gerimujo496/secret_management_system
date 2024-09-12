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
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UpdateAccountDto } from './dtos/update-account.dto';

import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoles } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('account')
@UseGuards(AuthGuard)
@UseGuards(RolesGuard)
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post()
  createAccount(@Body() body: CreateAccountDto, @Request() req: any) {
    return this.accountService.createAccount(body, req.user?.id);
  }

  @Get('/:accountId')
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR)
  getMyAccount(@Param('accountId') accountId: string, @Request() req: any) {
    return this.accountService.getMyAccount(req.user?.id, parseInt(accountId));
  }

  @Get('/:accountId/users')
  @Roles(UserRoles.ADMIN)
  getAccountUsers(@Param('accountId') accountId: string) {
    return this.accountService.getAccountUsers(parseInt(accountId));
  }

  @Patch('/:accountId')
  @Roles(UserRoles.ADMIN)
  updateAccount(
    @Param('accountId') accountId: string,
    @Body() body: UpdateAccountDto,
  ) {
    return this.accountService.updateAccount(parseInt(accountId), body);
  }

  @Delete('/:accountId')
  @Roles(UserRoles.ADMIN)
  deleteAccount(@Param('accountId') accountId: string) {
    return this.accountService.deleteAccount(parseInt(accountId));
  }
}
