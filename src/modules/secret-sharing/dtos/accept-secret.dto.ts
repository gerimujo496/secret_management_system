import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AcceptSecretDto {
  @IsString()
  @IsNotEmpty()
  hexKey: string;
  @IsNumber()
  code: number;
}
