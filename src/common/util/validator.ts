import { BadRequestException } from '@nestjs/common';

export function validateNonEmptyObject(data: object, message: string) {
  if (Object.keys(data).length === 0) {
    throw new BadRequestException(message);
  }
}
