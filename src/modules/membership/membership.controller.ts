import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { MembershipService } from './membership.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('membership')
// @UseGuards(AuthGuard) // apply when log in feature
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Patch('/:accountId/role/:userId')
  updateUserRole(
    @Request() req: any,
    @Param('userId') userId: string,
    @Param('accountId') accountId: string,
    @Body() body: UpdateRoleDto,
  ) {
    const adminId = req.user?.id || 1;

    return this.membershipService.updateUserRole({
      accountId: parseInt(accountId),
      adminId,
      userId: parseInt(userId),
      role: body.role,
    });
  }

  @Delete('/:membershipId/:accountId')
  deleteMembership(
    @Param('membershipId') membershipId: string,
    @Param('accountId') accountId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 2;

    return this.membershipService.deleteMembership({
      membershipId: parseInt(membershipId),
      accountId: parseInt(accountId),
      userId,
    });
  }
}
