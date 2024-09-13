import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  IsEmail,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
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
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(20, { message: 'Password must be at most 20 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  confirmationToken: string = null;
}
