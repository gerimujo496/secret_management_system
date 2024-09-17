import { PartialType } from '@nestjs/swagger';
import { CreateSecretsDto } from './createSecrets.dto';

export class UpdateSecretsDto extends PartialType(CreateSecretsDto) {}
