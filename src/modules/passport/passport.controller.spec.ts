import { Test, TestingModule } from '@nestjs/testing';
import { PassportController } from './passport.controller';
import { PassportService } from './passport.service';

describe('PassportController', () => {
  let controller: PassportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassportController],
      providers: [PassportService],
    }).compile();

    controller = module.get<PassportController>(PassportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
