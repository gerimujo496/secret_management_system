import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ErrorDal {
  handleError(error: any, errorType?: new (...args: any[]) => Error) {
    if (error instanceof PrismaClientKnownRequestError) {
      this.handlePrismaError(error);
    } else if (errorType && error instanceof errorType) {
      throw error;
    } else {
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  private handlePrismaError(error: PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P1010':
        throw new ForbiddenException('Denied access on database.');
      case 'P2002':
        throw new ConflictException('A unique constraint violation occurred.');
      case 'P2025':
        throw new NotFoundException('Record not found');
      default:
        throw new InternalServerErrorException('A database error occurred.');
    }
  }
}
