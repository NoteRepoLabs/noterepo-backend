import { Test, TestingModule } from '@nestjs/testing';
import { RepoService } from './repo.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageModule } from '../storage/storage.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

describe('RepoService', () => {
  let service: RepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule, UsersModule, EventEmitterModule.forRoot()],
      providers: [RepoService, PrismaService, UsersService, EmailService],
    }).compile();

    service = module.get<RepoService>(RepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
