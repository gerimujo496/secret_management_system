import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';

export class CreateSecretSharingDto {
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2024-09-11T11:58:09.976Z',
    required: true,
  })
  expirationTime: Date;
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'danielakokoneshi20@gmail.com',
    required: true,
  })
  receiverEmail: string;
  @IsNumber()
  @IsNotEmpty()
  @Max(2)
  @ApiProperty({
    example: '2',
    required: true,
  })
  numberOfTries: number;
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '2',
    required: true,
  })
  secretId: number;
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: '6',
    required: true,
  })
  passcode: number | null;
}
