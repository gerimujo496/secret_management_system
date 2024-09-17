import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAccountDto {
  @MinLength(3)
  @MaxLength(55)
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  description: string;
}
