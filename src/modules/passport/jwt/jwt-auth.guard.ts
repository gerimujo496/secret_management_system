import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { UserRoles } from '@prisma/client';
import { errorMessage } from '../../../constants/error-messages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      throw new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest();

    const requiredRoles = this.reflector.get<UserRoles[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const userId = request.user?.id;
    const unparsedAccountId = request.params.accountId;
    const accountId = parseInt(unparsedAccountId);

    if (!accountId) {
      const memberships = await this.prisma.membership.findMany({
        where: {
          userId,
          deletedAt: null,
          isConfirmed: true,
        },
        include: { role: true },
      });

      const userRoles = memberships.map(
        (membership) => membership.role.roleName,
      );

      if (!requiredRoles.some((role) => userRoles.includes(role))) {
        throw new UnauthorizedException(errorMessage.REQUIRED_ROLE);
      }

      return true;
    }

    const memberships = await this.prisma.membership.findMany({
      where: {
        userId,
        accountId,
        deletedAt: null,
        isConfirmed: true,
      },
      include: { role: true },
    });

    const userRoles = memberships.map((membership) => membership.role.roleName);

    if (!requiredRoles.some((role) => userRoles.includes(role))) {
      throw new UnauthorizedException(errorMessage.REQUIRED_ROLE);
    }

    return true;
  }
}
