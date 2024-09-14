import { ApiProperty } from '@nestjs/swagger';

export class TwoFaCodeDto {
  @ApiProperty()
  twoFactorAuthenticationSecret: number;
}
