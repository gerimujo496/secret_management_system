import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserDal } from './user.dal';
describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
