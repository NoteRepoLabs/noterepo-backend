import { Test, TestingModule } from '@nestjs/testing';
import { RepoService } from './repo.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RepoService', () => {
  let service: RepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepoService, PrismaService],
    }).compile();

    service = module.get<RepoService>(RepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
