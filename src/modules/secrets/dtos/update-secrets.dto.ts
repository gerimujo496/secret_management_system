import { PartialType } from '@nestjs/swagger';
import { CreateSecretsDto } from './create-secrets.dto';

export class UpdateSecretsDto extends PartialType(CreateSecretsDto) {}
