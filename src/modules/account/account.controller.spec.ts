import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorDal } from '../../common/dal/error.dal';
import { AccountDAL } from './dal/account.dal';
import { CreateAccountDto } from './dtos/create-account.dto';
import { UpdateAccountDto } from './dtos/update-account.dto';

describe('AccountController', () => {
  let accountController: AccountController;
  let accountService: AccountService;
  let accountDAL: AccountDAL;
  let errorDAL: ErrorDal;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [AccountService, PrismaService, AccountDAL, ErrorDal],
    }).compile();

    accountController = module.get<AccountController>(AccountController);
    accountService = module.get<AccountService>(AccountService);
    accountDAL = module.get<AccountDAL>(AccountDAL);
    errorDAL = module.get<ErrorDal>(ErrorDal);
  });

  it('should be defined', () => {
    expect(accountController).toBeDefined();
  });

  it('should get accounts and call accountService.getAccounts', async () => {
    const req = { user: { id: 1 } };

    jest.spyOn(accountService, 'getAccounts').mockResolvedValue(undefined);

    await accountController.getAccounts(req);

    expect(accountService.getAccounts).toHaveBeenCalledWith(req.user.id);
  });

  it('should create an account and call accountService.createAccount', async () => {
    const createAccountDto = {
      name: 'Test Account',
      description: 'This is a test account',
    } as CreateAccountDto;

    const req = { user: { id: 1 } };

    jest.spyOn(accountService, 'createAccount').mockResolvedValue(undefined);

    await accountController.createAccount(createAccountDto, req);

    expect(accountService.createAccount).toHaveBeenCalledWith(
      createAccountDto,
      req.user.id,
    );
  });

  it('should get my account and call accountService.getMyAccount', async () => {
    const accountId = 2;
    const req = { user: { id: 1 } };

    jest.spyOn(accountService, 'getMyAccount').mockResolvedValue(undefined);

    await accountController.getMyAccount(accountId.toString(), req);

    expect(accountService.getMyAccount).toHaveBeenCalledWith(
      req.user.id,
      accountId,
    );
  });

  it('should get my account users and call accountService.getAccountUsers', async () => {
    const accountId = 2;

    jest.spyOn(accountService, 'getAccountUsers').mockResolvedValue(undefined);

    await accountController.getAccountUsers(accountId.toString());

    expect(accountService.getAccountUsers).toHaveBeenCalledWith(accountId);
  });

  it('should get my account users and call accountService.updateAccount', async () => {
    const updateAccountBody = {
      name: 'Test Account Update',
      description: 'This is a test account update',
    } as UpdateAccountDto;

    const accountId = 2;

    jest.spyOn(accountService, 'updateAccount').mockResolvedValue(undefined);

    await accountController.updateAccount(
      accountId.toString(),
      updateAccountBody,
    );

    expect(accountService.updateAccount).toHaveBeenCalledWith(
      accountId,
      updateAccountBody,
    );
  });
});
