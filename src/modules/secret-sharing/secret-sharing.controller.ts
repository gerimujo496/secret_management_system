import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Render,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SecretSharingService } from './secret-sharing.service';
import { CreateSecretSharingDto } from './dtos/create-secret-sharing.dto';
import { AcceptSecretDto } from './dtos/accept-secret.dto';
import { SecretSharingDAL } from './secret-sharing.dal';

import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from '@prisma/client';
import { controller_path } from '../../constants/controller-path';
import { JwtAuthGuard } from '../passport/jwt/jwt-auth.guard';

@ApiTags(controller_path.SECRETSHARE.PATH)
@Controller(controller_path.SECRETSHARE.PATH)
export class SecretSharingController {
  constructor(
    private readonly secretsSharingService: SecretSharingService,
    private readonly secretShareDAL: SecretSharingDAL,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(controller_path.SECRETSHARE.GET_KEY)
  @Roles(UserRoles.ADMIN)
  async generateKey(@Param('accountId', ParseIntPipe) accountId: number) {
    return this.secretsSharingService.genereateKey(accountId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(controller_path.SECRETSHARE.CREATE_SHARE_SECRET)
  @Roles(UserRoles.ADMIN)
  async shareSecret(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() createSecretSharingDto: CreateSecretSharingDto,
  ) {
    return this.secretsSharingService.shareSecret(
      createSecretSharingDto,
      accountId,
    );
  }

  @Get(controller_path.SECRETSHARE.GET_SHARE_SECRET_FORM)
  @Render('share-secretKey.hbs')
  async getSecretSharePage(
    @Param('secretShareId', ParseIntPipe) secretShareId: number,
  ) {
    const secretShare =
      await this.secretShareDAL.findSecretShareById(secretShareId);

    if (!secretShare) {
      throw new NotFoundException('Secret share not found');
    }

    return { secretShareId: secretShare.id };
  }

  @Post(controller_path.SECRETSHARE.POST_NEW_SHARE_SECRET)
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
