import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRoles } from '@prisma/client';
import { errorMessage } from 'src/constants/error-messages';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<UserRoles[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || 2;//testing

    if (!userId) {
      throw new ForbiddenException(errorMessage.FORBIDDEN_ACCESS);
    }

    const accountId = request.params.accountId;

    const memberships = await this.prisma.membership.findMany({
      where: {
        userId,
        accountId: parseInt(accountId),
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
