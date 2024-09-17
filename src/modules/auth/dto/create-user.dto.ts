import { ApiProperty } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/library';
import {
  IsString,
  MaxLength,
  IsEmail,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  id: number;

  @ApiProperty()
  @IsString()
  @MaxLength(20, { message: 'First name must be at most 20 characters' })
  firstName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20, { message: 'Last name must be at most 20 characters' })
  lastName: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(50, { message: 'Email must be at most 50 characters' })
  email: string;

  @ApiProperty()
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,20}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(20, { message: 'Password must be at most 20 characters' })
  password: string;

  confirmationToken: string = null;

  twoFactorAuthenticationSecret?: JsonValue;

  isTwoFactorAuthenticationEnabled?: boolean;
}
