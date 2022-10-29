import { Test, TestingModule } from '@nestjs/testing';
import { TimeutilsService } from './timeutils.service';

describe('TimeutilsService', () => {
  let service: TimeutilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeutilsService],
    }).compile();

    service = module.get<TimeutilsService>(TimeutilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
