import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AcceptSecretDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '06bad45a93d3a5cd9065bc6827c2dfffd30b01ab5913539315f006efce3d555e',
    required: true,
  })
  hexKey: string;
  @IsNumber()
  @ApiProperty({
    example: '324569',
    required: true,
  })
  code: number;
}
