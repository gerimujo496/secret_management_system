import { Test, TestingModule } from '@nestjs/testing';
import { SecretsController } from './secrets.controller';
import { SecretsService } from './secrets.service';

describe('SecretsController', () => {
  let controller: SecretsController;
  let service: SecretsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecretsController],
      providers: [
        {
          provide: SecretsService,
          useValue: {
          
            createSecret: jest.fn(),
            findAllSecretsByAccount: jest.fn(),
            findSecretByIdAndAccount: jest.fn(),
            updateSecret: jest.fn(),
            deleteSecret: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SecretsController>(SecretsController);
    service = module.get<SecretsService>(SecretsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
