import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { CreateSecretsDto } from './dtos/createSecrets.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateSecretsDto } from './dtos/updateSecrets.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from '@prisma/client';
import { controller_path } from 'src/constants/controller-path';
import { JwtAuthGuard } from '../passport/jwt/jwt-auth.guard';

@ApiTags(controller_path.SECRET.PATH)
@Controller(controller_path.SECRET.PATH)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @Post(controller_path.SECRET.CREATE_SECRET)
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR)
  async createSecret(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() createSecretDto: CreateSecretsDto,
  ) {
    return this.secretsService.createSecret(createSecretDto, accountId);
  }

  @Get(controller_path.SECRET.GET_SECRETS)
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR, UserRoles.VIEWER)
  async getSecretsByAccount(
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return this.secretsService.findAllSecretsByAccount(accountId);
  }

  @Get(controller_path.SECRET.GET_ONE)
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR, UserRoles.VIEWER)
  async getSecretById(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('secretId', ParseIntPipe) secretId: number,
  ) {
    return this.secretsService.findSecretByIdAndAccount(accountId, secretId);
  }

  @Patch(controller_path.SECRET.UPDATE_SECRETS)
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR)
  async updateSecret(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('secretId', ParseIntPipe) secretId: number,
    @Body() updateSecretDto: UpdateSecretsDto,
  ) {
    return this.secretsService.updateSecret(
      accountId,
      secretId,
      updateSecretDto,
    );
  }
  @Delete(controller_path.SECRET.DELETE_SECRET)
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR)
  async deleteSecret(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('secretId', ParseIntPipe) secretId: number,
  ) {
    return this.secretsService.deleteSecret(accountId, secretId);
  }
}
