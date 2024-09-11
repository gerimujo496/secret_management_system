import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { CreateSecretsDto } from './dtos/create-secrets.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdateSecretsDto } from './dtos/update-Secrets.dto';

@ApiTags('secrets')
@Controller('secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @Post(':accountId/secrets')
  async createSecret(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() createSecretDto: CreateSecretsDto,
  ) {
    return this.secretsService.createSecret(createSecretDto, accountId);
  }

  @Get(':accountId/secrets')
  async getSecretsByAccount(
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return this.secretsService.findAllSecretsByAccount(accountId);
  }

  @Get(':accountId/secrets/:secretId')
  async getSecretById(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('secretId', ParseIntPipe) secretId: number,
  ) {
    return this.secretsService.findSecretByIdAndAccount(accountId, secretId);
  }

  @Patch(':accountId/secrets/:secretId')
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
  @Delete(':accountId/secrets/:secretId')
  async deleteSecret(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('secretId', ParseIntPipe) secretId: number,
  ) {
    return this.secretsService.deleteSecret(accountId, secretId);
  }
}
