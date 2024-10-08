import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
  Render,
} from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UpdateRoleDto } from './dtos/update-role.dto';
import { MembershipService } from './membership.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { controller_path } from '../../constants/controller-path';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { CreateInvitationDTO } from './dtos/create-invitation.dto';
import { JwtAuthGuard } from '../passport/jwt/jwt-auth.guard';

@Controller(controller_path.MEMBERSHIP.PATH)
@ApiTags(controller_path.MEMBERSHIP.PATH)
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Get(controller_path.MEMBERSHIP.REGISTER_AND_CONFIRM)
  @Render('signup')
  registerAndCreate(@Query() query: any) {
    return this.membershipService.registerAndCreate(
      query.email,
      query.membershipId,
    );
  }

  @Post(controller_path.MEMBERSHIP.REGISTER_AND_CONFIRM)
  @Render('index')
  async registerAndConfirmInvitation(
    @Body() body: CreateUserDto,
    @Query() query: any,
  ) {
    return await this.membershipService.registerAndConfirmInvitation(
      body,
      parseInt(query.membershipId),
    );
  }

  @Get(controller_path.MEMBERSHIP.CONFIRM)
  @Render('index')
  confirmInvitation(@Query() query: any) {
    return this.membershipService.confirmInvitation(
      parseInt(query.membershipId),
      query.token,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(controller_path.MEMBERSHIP.ACCOUNT_MEMBERSHIPS)
  @Roles(UserRoles.ADMIN)
  getAccountMemberships(@Param('accountId') accountId: string) {
    return this.membershipService.getAccountMemberships(parseInt(accountId));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(controller_path.MEMBERSHIP.INVITE_USER)
  @Roles(UserRoles.ADMIN)
  inviteUser(
    @Param('accountId') accountId: string,
    @Request() request: any,
    @Body() body: CreateInvitationDTO,
  ) {
    return this.membershipService.inviteUser(
      parseInt(accountId),
      body.email,
      request.user?.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(controller_path.MEMBERSHIP.UPDATE_ROLE)
  @Roles(UserRoles.ADMIN)
  updateUserRole(
    @Param('userId') userId: string,
    @Param('accountId') accountId: string,
    @Body() body: UpdateRoleDto,
  ) {
    return this.membershipService.updateUserRole({
      accountId: parseInt(accountId),
      userId: parseInt(userId),
      role: body.role,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(controller_path.MEMBERSHIP.DELETE_MEMBERSHIP)
  @Roles(UserRoles.ADMIN)
  deleteMembership(
    @Param('membershipId') membershipId: string,
    @Param('accountId') accountId: string,
  ) {
    return this.membershipService.deleteMembership(
      parseInt(membershipId),
      parseInt(accountId),
    );
  }
}
