import { Test, TestingModule } from '@nestjs/testing';
import { RepoController } from './repo.controller';
import { RepoService } from './repo.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '../jwt/jwt.service';
import { CookieService } from '../cookie/cookie.service';
import {StorageModule} from '../storage/storage.module'

describe('RepoController', () => {
  let controller: RepoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
      controllers: [RepoController],
      providers: [RepoService, PrismaService, JwtService, CookieService],
    }).compile();

    controller = module.get<RepoController>(RepoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
