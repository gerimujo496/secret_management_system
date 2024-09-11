
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SecretsDAL } from './secrets.dal'; 
import { CreateSecretsDto } from './dtos/create-secrets.dto';
import { UpdateSecretsDto } from './dtos/update-Secrets.dto';

@Injectable()
export class SecretsService {
  constructor(private readonly secretsDAL: SecretsDAL) {}

  async createSecret(createSecretDto: CreateSecretsDto)  {
    try{
        const createdSecret=  await this.secretsDAL.createSecret(createSecretDto);
        if (!createdSecret) {
            throw new InternalServerErrorException('Failed to create secret.');
          }
          return createdSecret}
catch{
    throw new BadRequestException('Could not create secret');}

}
async getSecrets(){
    try{
        const secrets= await this.secretsDAL.findAllSecrets()
        return secrets
    }
    catch{
        throw new NotFoundException('No secret found')
    }
}

async getSecretById(id: number) {
    try{const secret = await this.secretsDAL.findSecretById(id);
        
        if (!secret) {
          throw new NotFoundException(`Secret with ID ${id} not found`);
        }
        console.log(secret)
        return secret;}
    catch (error){
        console.log(error)
        throw new NotFoundException(`Secret with ID ${id} not found`)
    }
  }

 async updateSecret(id: number, updateSecretDto: UpdateSecretsDto) {
    try{
        await this.getSecretById(id); 
        return this.secretsDAL.updateSecret(id, updateSecretDto);
    }
   catch{
    throw new BadRequestException('Could not create secret');
   }
  }

  async deleteSecret(id: number) {
    try{
        await this.getSecretById(id);
        return this.secretsDAL.deleteSecret(id);
    }
   catch{
    throw new BadRequestException('Could not delete secret');
   }
  }
}


