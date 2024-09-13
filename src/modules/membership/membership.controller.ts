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
import { UpdateRoleDto } from './dtos/update-role.dto';
import { MembershipService } from './membership.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoles } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('membership')
// @UseGuards(AuthGuard)
@UseGuards(RolesGuard)
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Get('/confirm')
  @Render('index')
  confirmInvitation(@Query() query: any) {
    return this.membershipService.confirmInvitation(
      parseInt(query.membershipId),
    );
  }

  @Post('/:accountId/:userId')
  @Roles(UserRoles.ADMIN)
  inviteUser(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @Request() request: any,
  ) {
    return this.membershipService.inviteUser(
      parseInt(accountId),
      parseInt(userId),
      parseInt(request.user?.id),
    );
  }

  @Patch('/:accountId/role/:userId')
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

  @Delete('/:membershipId/:accountId')
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
