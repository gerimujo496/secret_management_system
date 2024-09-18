import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generate } from 'generate-password';

import { CreateAccountDto } from './dtos/create-account.dto';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { AccountDAL } from './dal/account.dal';
import { validateNonEmptyObject } from '../../common/util/validator';
import { errorMessage } from '../../constants/error-messages';

@Injectable()
export class AccountService {
  constructor(private accountDAL: AccountDAL) {}

  async createAccount(data: CreateAccountDto, userId: number) {
    if (!userId)
      throw new BadRequestException(errorMessage.ID_REQUIRED('User ID'));

    const user = await this.accountDAL.findUserById(userId);

    if (!user) {
      throw new NotFoundException(errorMessage.INVALID_ENTITY('user'));
    }

    const password = generate({
      length: 15,
      numbers: true,
    });

    const [account, membership] =
      await this.accountDAL.createMembershipAndAccount(data, userId, password);

    return { account, membership };
  }

  async getAccounts(userId: number) {
    if (!userId)
      throw new BadRequestException(errorMessage.ID_REQUIRED('User ID'));

    const myAccounts = await this.accountDAL.findMyAccounts(userId);

    return myAccounts;
  }

  async getMyAccount(userId: number, accountId: number) {
    if (!userId || !accountId)
      throw new BadRequestException(
        errorMessage.BOTH_REQUIRED('User ID', 'Account ID'),
      );

    const account = await this.accountDAL.findAccount(accountId);

    if (!account) {
      throw new NotFoundException(errorMessage.INVALID_ENTITY('account'));
    }

    const membership = await this.accountDAL.findMembership(accountId, userId);

    if (!membership) {
      throw new NotFoundException(errorMessage.INVALID_ENTITY('membership'));
    }

    return account;
  }

  async getAccountUsers(accountId: number) {
    if (!accountId)
      throw new BadRequestException(errorMessage.ID_REQUIRED('Account ID'));

    return await this.accountDAL.findUsersMembershipsByAccount(accountId);
  }

  async updateAccount(
    accountId: number,
    newAccountInformation: UpdateAccountDto,
  ) {
    if (!accountId)
      throw new BadRequestException(errorMessage.ID_REQUIRED('Account ID'));

    validateNonEmptyObject(newAccountInformation, errorMessage.EMPTY_DATA);

    const currentAccount = await this.accountDAL.findAccount(accountId);

    if (!currentAccount) {
      throw new NotFoundException(errorMessage.INVALID_ENTITY('account'));
    }

    return await this.accountDAL.updateAccount(
      currentAccount.id,
      newAccountInformation,
    );
  }

  async deleteAccount(accountId: number) {
    if (!accountId)
      throw new BadRequestException(errorMessage.ID_REQUIRED('Account ID'));

    const memberships =
      await this.accountDAL.findAllMembershipsForAccount(accountId);

    if (memberships.length === 0) {
      return new NotFoundException(errorMessage.INVALID_ENTITY('account'));
    }

    const [deletedAccount, deletedMemberships] =
      await this.accountDAL.deleteMembershipsAndAccount(accountId);

    return { deletedAccount, deletedMemberships };
  }
}
