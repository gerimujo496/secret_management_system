import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Render,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SecretSharingService } from './secret-sharing.service';
import { CreateSecretSharingDto } from './dtos/create-secretSharing.dto';
import { AcceptSecretDto } from './dtos/accept-secret.dto';
import { SecretSharingDAL } from './secret-sharing.dal';

@ApiTags('secret-sharing')
@Controller('secret-sharing')
export class SecretSharingController {
  constructor(
    private readonly secretsSharingService: SecretSharingService,
    private readonly secretShareDAL: SecretSharingDAL,
  ) {}

  @Get('/:accountId')
  async generateKey(@Param('accountId', ParseIntPipe) accountId: number) {
    return this.secretsSharingService.genereateKey(accountId);
  }
  @Post('/:accountGiverId')
  async shareSecret(
    @Param('accountGiverId', ParseIntPipe) accountGiverId: number,
    @Body() createSecretSharingDto: CreateSecretSharingDto,
  ) {
    return this.secretsSharingService.shareSecret(
      createSecretSharingDto,
      accountGiverId,
    );
  }

  @Get('/accept-secret/:secretShareId')
  @Render('share-secretKey.hbs')
  async getSecretSharePage(
    @Param('secretShareId', ParseIntPipe) secretShareId: number,
  ) {
    const secretShare = await this.secretShareDAL.findSecretShareById(secretShareId);
    console.log(secretShare);
    if (!secretShare) {
      console.log(secretShare);
      throw new NotFoundException('Secret share not found');
    }
    return { secretShareId: secretShare.id };
  }

  @Post('/accept/:secretShareId')
  @Render('secretShareConfirmation.hbs')
  async acceptSecret(
    @Param('secretShareId', ParseIntPipe) secretShareId: number,
    @Body() acceptSecretDto: AcceptSecretDto,
  ) {
    return await this.secretsSharingService.acceptSecret(
      secretShareId,
      acceptSecretDto,
    );
  }
}
