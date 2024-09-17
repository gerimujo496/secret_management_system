import { Test, TestingModule } from '@nestjs/testing';
import { SecretSharingService } from './secret-sharing.service';

describe('SecretSharingService', () => {
  let service: SecretSharingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecretSharingService],
    }).compile();

    service = module.get<SecretSharingService>(SecretSharingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
