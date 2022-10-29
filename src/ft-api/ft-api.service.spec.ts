import { Test, TestingModule } from '@nestjs/testing';
import { FtApiService } from './ft-api.service';

describe('FtApiService', () => {
  let service: FtApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FtApiService],
    }).compile();

    service = module.get<FtApiService>(FtApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
