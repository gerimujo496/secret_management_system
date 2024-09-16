import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { MembershipService } from './membership.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoles } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { controller_path } from 'src/constants/controller-path';

@Controller(controller_path.MEMBERSHIP.PATH)
@UseGuards(AuthGuard)
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
