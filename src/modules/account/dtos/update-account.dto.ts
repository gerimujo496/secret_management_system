import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAccountDto {
  @ApiProperty()
  @MinLength(3)
  @MaxLength(55)
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsOptional()
  description?: string;
}
