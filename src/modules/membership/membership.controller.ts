import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

import { UpdateRoleDto } from './dtos/update-role.dto';
import { MembershipService } from './membership.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { controller_path } from '../../constants/controller-path';
import { JwtAuthGuard } from '../passport/jwt/jwt-auth.guard';

@Controller(controller_path.MEMBERSHIP.PATH)
@ApiTags(controller_path.MEMBERSHIP.PATH)
@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

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
