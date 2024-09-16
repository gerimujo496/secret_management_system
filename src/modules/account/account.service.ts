import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountDto } from './dtos/create-account.dto';
import { generate } from 'generate-password';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { AccountDAL } from './dal/account.dal';
import { validateNonEmptyObject } from 'src/common/util/validator';

@Injectable()
export class AccountService {
  constructor(private accountDAL: AccountDAL) {}

  async createAccount(data: CreateAccountDto, userId: number) {
    if (!userId) throw new BadRequestException('User ID is required.');

    const user = await this.accountDAL.findUserById(userId);

    if (!user) {
      throw new NotFoundException('Invalid user or user not found.');
    }

    const password = generate({
      length: 15,
      numbers: true,
    });

    const [account, membership] =
      await this.accountDAL.createMembershipAndAccount(data, userId, password);

    return { account, membership };
  }

  async getMyAccount(userId: number, accountId: number) {
    if (!userId || !accountId)
      throw new BadRequestException(
        'User ID and Account ID are both required.',
      );

    const account = await this.accountDAL.findAccount(accountId);
    await this.accountDAL.findMembership(accountId, userId);

    return account;
  }

  async getAccountUsers(accountId: number) {
    if (!accountId) throw new BadRequestException('Account ID is required.');

    return await this.accountDAL.findUsersMembershipsByAccount(accountId);
  }

  async updateAccount(
    accountId: number,
    newAccountInformation: UpdateAccountDto,
  ) {
    if (!accountId) throw new BadRequestException('Account ID is required.');

    validateNonEmptyObject(newAccountInformation, 'No data provided');

    const currentAccount = await this.accountDAL.findAccount(accountId);

    return await this.accountDAL.updateAccount(
      currentAccount.id,
      newAccountInformation,
    );
  }

  async deleteAccount(accountId: number) {
    if (!accountId) throw new BadRequestException('Account ID is required.');

    const memberships =
      await this.accountDAL.findAllMembershipsForAccount(accountId);

    if (memberships.length === 0) {
      return new NotFoundException('Account is invalid or account not found. ');
    }

    const [deletedAccount, deletedMemberships] =
      await this.accountDAL.deleteMembershipsAndAccount(accountId);

    return { deletedAccount, deletedMemberships };
  }
}
