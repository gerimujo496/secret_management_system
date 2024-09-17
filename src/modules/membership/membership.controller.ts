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
  Req,
} from '@nestjs/common';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { MembershipService } from './membership.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoles } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { controller_path } from 'src/constants/controller-path';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateInvitationDTO } from './dtos/create-invitation.dto';

@Controller(controller_path.MEMBERSHIP.PATH)
// @UseGuards(AuthGuard)
@UseGuards(RolesGuard)
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

  @Post(controller_path.MEMBERSHIP.INVITE_USER)
  @Roles(UserRoles.ADMIN)
  inviteUser(
    @Param('accountId') accountId: string,
    @Request() request: any,
    @Body() body: CreateInvitationDTO,
  ) {
    const adminId = request.user?.id || 1;
    return this.membershipService.inviteUser(
      parseInt(accountId),
      body.email,
      adminId,
    );
  }

  // @Post(controller_path.MEMBERSHIP.INVITE_USER)
  // @Roles(UserRoles.ADMIN)
  // inviteUnregisteredUser(
  //   @Param('accountId') accountId: string,
  //   @Param('userId') userId: string,
  //   @Request() request: any,
  // ) {
  //   const userIdT = request.user?.id || 1;
  //   return this.membershipService.inviteUser(
  //     parseInt(accountId),
  //     parseInt(userId),
  //     parseInt(userIdT),
  //   );
  // }

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
