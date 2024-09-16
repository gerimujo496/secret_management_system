import { Test, TestingModule } from '@nestjs/testing';
import { SecretSharingController } from './secret-sharing.controller';
import { SecretSharingService } from './secret-sharing.service';

describe('SecretsController', () => {
  let controller: SecretSharingController;
  let service: SecretSharingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecretSharingController],
      providers: [
        {
          provide: SecretSharingService,
          useValue: {
            genereateKey: jest.fn(),
            shareSecret: jest.fn(),
            sendVerificationCode: jest.fn(),
            acceptSecret: jest.fn(),
           
          },
        },
      ],
    }).compile();

    controller = module.get<SecretSharingController>(SecretSharingController);
    service = module.get<SecretSharingService>(SecretSharingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
