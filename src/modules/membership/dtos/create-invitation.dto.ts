import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateInvitationDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
}
