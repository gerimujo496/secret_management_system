import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAccountDto {
  @MinLength(3)
  @MaxLength(55)
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsOptional()
  description: string;
}
