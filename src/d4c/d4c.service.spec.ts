import { Test, TestingModule } from '@nestjs/testing';
import { D4cService } from './d4c.service';

describe('D4cService', () => {
  let service: D4cService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [D4cService],
    }).compile();

    service = module.get<D4cService>(D4cService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
