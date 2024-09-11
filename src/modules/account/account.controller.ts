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

@Controller('account')
// @UseGuards(AuthGuard) // apply when log in feature
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post()
  createAccount(@Body() body: CreateAccountDto, @Request() req: any) {
    const userId = req.user?.id || 1;
    return this.accountService.createAccount(body, userId);
  }

  @Get('/:accountId')
  getMyAccount(@Param('accountId') accountId: string, @Request() req: any) {
    const userId = req.user?.id || 1;
    return this.accountService.getMyAccount(userId, parseInt(accountId));
  }

  @Get('/:accountId/users')
  getAccountUsers(@Param('accountId') accountId: string, @Request() req: any) {
    const userId = req.user?.id || 1;
    return this.accountService.getAccountUsers(parseInt(accountId), userId);
  }

  @Patch('/:accountId')
  updateAccount(
    @Param('accountId') accountId: string,
    @Body() body: UpdateAccountDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 2;
    return this.accountService.updateAccount({
      accountId: parseInt(accountId),
      newAccountInformation: body,
      userId,
    });
  }

  @Delete('/:accountId')
  deleteAccount(@Param('accountId') accountId: string, @Request() req: any) {
    const userId = req.user?.id || 1;
    return this.accountService.deleteAccount(parseInt(accountId), userId);
  }
}
