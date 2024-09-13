import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SecretSharingService } from './secret-sharing.service';
import { CreateSecretSharingDto } from './dtos/create-secretSharing.dto';


@ApiTags('secret-sharing')
@Controller('secret-sharing')
export class SecretSharingController {
    constructor(private readonly secretsSharingService: SecretSharingService) {}
  
    @Get(':accountId')
    async getSecretsByAccount(
      @Param('accountId', ParseIntPipe) accountId: number,
    ) {
      return this.secretsSharingService.genereateKey(accountId);
    }
    @Post('share/:accountGiverId')
    async shareSecret(
      @Param('accountGiverId', ParseIntPipe) accountGiverId: number,
      @Body() createSecretSharingDto: CreateSecretSharingDto,
    ) {
      return this.secretsSharingService.shareSecret(createSecretSharingDto, accountGiverId);
    }
}
