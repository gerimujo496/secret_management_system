import { Test, TestingModule } from '@nestjs/testing';
import { SecretSharingController } from './secret-sharing.controller';
import { SecretSharingService } from './secret-sharing.service';
import { SecretSharingDAL } from './secret-sharing.dal'
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
        {
            provide: SecretSharingDAL,
            useValue: {createSecret:jest.fn(),
                findSecretShareById:jest.fn(),
                decrementTries:jest.fn(),
                markAsAccepted:jest.fn(),
                addSecretToAccount: jest.fn(),
                updateSecretSharing:jest.fn()



            }
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
