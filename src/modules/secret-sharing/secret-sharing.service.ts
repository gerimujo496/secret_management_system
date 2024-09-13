import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountDAL } from '../account/account.dal';
import { generateKey } from '../../common/utils/secretSharing';
import { CreateSecretSharingDto } from './dtos/create-secretSharing.dto';
import { SecretSharingDAL } from './secret-sharing.dal';
@Injectable()
export class SecretSharingService {
  constructor(
   
    private readonly accountDAL: AccountDAL,
   
    private readonly secretsSharingDAL: SecretSharingDAL,
  ) {}

  async genereateKey(accountId: number) {
    const account = await this.accountDAL.findAccountById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    const  KeyValue = generateKey( account.password);

    if (!KeyValue) {
      throw new NotFoundException('Key not found for this account');
    }
    return KeyValue;
  }
  async shareSecret(createSecretSharingDto: CreateSecretSharingDto, accountGiverId: number) {
 
    const accountGiver = await this.accountDAL.findAccountById(accountGiverId);
    if (!accountGiver) {
      throw new NotFoundException('Account giver not found');
    }

    const KeyValue = generateKey(accountGiver.password);

   
    return await this.secretsSharingDAL.createSecret(createSecretSharingDto, accountGiverId);
  }
}
