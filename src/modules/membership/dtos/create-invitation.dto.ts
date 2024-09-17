import { IsEmail } from 'class-validator';

export class CreateInvitationDTO {
  @IsEmail()
  email: string;
}
