import { Test, TestingModule } from '@nestjs/testing';
import { RepoService } from './repo.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageModule } from '../storage/storage.module'
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('RepoService', () => {
  let service: RepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule, EventEmitterModule.forRoot()],
      providers: [RepoService, PrismaService],
    }).compile();

    service = module.get<RepoService>(RepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
