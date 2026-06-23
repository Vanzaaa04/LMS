import { Test, TestingModule } from '@nestjs/testing';
import { MaterialService } from './material.service';

import { PrismaService } from '../prisma.service';

describe('MaterialService', () => {
  let service: MaterialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialService, PrismaService],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
