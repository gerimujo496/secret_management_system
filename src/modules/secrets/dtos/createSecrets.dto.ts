import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSecretsDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Database Password',
    required: true,
  })
  name: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Password for the Postgres database',
    required: true,
  })
  description: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'supersecretpassword123',
    required: true,
  })
  value: string;
}
