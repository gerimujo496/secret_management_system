
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSecretsDto } from './dtos/create-Secrets.dto';
import { UpdateSecretsDto } from './dtos/update-Secrets.dto';

@Injectable()
export class SecretsDAL {
  constructor(private readonly prisma: PrismaService) {}

  async createSecret(createSecretDto: CreateSecretsDto) {
    return  await this.prisma.secret.create({
        data: {
          name: createSecretDto.name,
          description: createSecretDto.description,
          value: createSecretDto.value, 
         
        },
      });
  }

  async findAllSecrets(){
return  await this.prisma.secret.findMany()
  }

  async findSecretById(id : number) {
   
    return  await this.prisma.secret.findUnique({ where: { id } });
  }

async deleteSecret(id: number){
   
    return await this.prisma.secret.delete({ where: { id } })
}

async updateSecret(id: number, updateSecretDto: UpdateSecretsDto) {
    return this.prisma.secret.update({
      where: { id },
      data: updateSecretDto,
    });
  }

}
