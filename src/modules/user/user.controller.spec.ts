import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserDal } from './user.dal';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, {
        provide: UserDal,
        useValue: {
          create:jest.fn(),
          findByEmail:jest.fn(),
          getAllUsers:jest.fn(),
          findOneById:jest.fn(),
          update:jest.fn(),
          resetPassword:jest.fn(),
          delete:jest.fn()
        }, 
      },],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
