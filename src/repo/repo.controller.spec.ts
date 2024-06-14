import { Test, TestingModule } from '@nestjs/testing';
import { RepoController } from './repo.controller';
import { RepoService } from './repo.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '../jwt/jwt.service';
import { StorageModule } from '../storage/storage.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

describe('RepoController', () => {
  let controller: RepoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule, UsersModule, EventEmitterModule.forRoot()],
      controllers: [RepoController],
      providers: [
        RepoService,
        PrismaService,
        JwtService,
        UsersService,
        EmailService,
      ],
    }).compile();

    controller = module.get<RepoController>(RepoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
