
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { CreateSecretsDto } from './dtos/create-secrets.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdateSecretsDto } from './dtos/update-Secrets.dto';

@ApiTags('secrets')
@Controller('secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @Post()
  async createSecret(@Body() createSecretDto: CreateSecretsDto) {

    return this.secretsService.createSecret(createSecretDto);
  }

  @Get()
  getSecrets() {
    return this.secretsService.getSecrets();
  }
  @Get(':id')
  getSecretById(@Param('id',ParseIntPipe) id: number) {
    return this.secretsService.getSecretById(id);
  }

  @Put(':id')
  updateSecret(
    @Param('id',ParseIntPipe) id: number,
    @Body() updateSecretDto: UpdateSecretsDto,
  ) {
    return this.secretsService.updateSecret(id, updateSecretDto);
  }
  @Delete(':id',)
  deleteSecret(@Param('id',ParseIntPipe) id: number) {
    return this.secretsService.deleteSecret(id);
  }
}
