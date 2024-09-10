import { HttpException, HttpStatus } from '@nestjs/common';

export const throwError = (status: HttpStatus, error: string) => {
  throw new HttpException(
    {
      status: status,
      error: error,
    },
    status,
  );
};
