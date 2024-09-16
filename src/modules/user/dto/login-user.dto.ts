import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsEmail, MinLength } from 'class-validator';

export class LogInUserDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(50, { message: 'Email must be at most 50 characters' })
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(20, { message: 'Password must be at most 20 characters' })
  password: string;
}
