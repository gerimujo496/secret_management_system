import { Test, TestingModule } from '@nestjs/testing';
import { SecretSharingController } from './secret-sharing.controller';

describe('SecretSharingController', () => {
  let controller: SecretSharingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecretSharingController],
    }).compile();

    controller = module.get<SecretSharingController>(SecretSharingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
