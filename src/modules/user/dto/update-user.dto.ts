import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  @MaxLength(20, { message: 'First name must be at most 20 characters' })
  firstName: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  @MaxLength(20, { message: 'Last name must be at most 20 characters' })
  lastName: string;

  @IsOptional()
  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(50, { message: 'Email must be at most 50 characters' })
  email: string;

  confirmationToken: string;
}
