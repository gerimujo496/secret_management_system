import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ErrorDal {
  handleError(error: any) {
    if (error instanceof PrismaClientKnownRequestError) {
      this.handlePrismaError(error);
    } else {
      throw new InternalServerErrorException(error.message);
    }
  }

  private handlePrismaError(error: PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P1000':
      case 'P1001':
      case 'P1002':
      case 'P1003':
        throw new InternalServerErrorException(
          'A database error occurred. Please check your database connection or schema.',
        );

      case 'P1010':
        throw new NotFoundException('The requested record was not found.');

      case 'P2002':
        throw new ConflictException('A unique constraint violation occurred.');

      case 'P2025':
        throw new NotFoundException(
          'The record you are trying to update or delete was not found.',
        );

      case 'P2026':
      case 'P2003':
        throw new ConflictException(
          'A foreign key constraint violation occurred.',
        );

      case 'P2024':
        throw new InternalServerErrorException(
          'An invalid field error occurred. Please check the data being sent to the database.',
        );

      default:
        throw new InternalServerErrorException('A database error occurred.');
    }
  }
}
