import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../storage/cloudinary/cloudinary.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from '../../users/users.module';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../email/email.service';
import { RepoModule } from '../repo.module';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, RepoModule,EventEmitterModule.forRoot()],
      providers: [
        FilesService,
        PrismaService,
        CloudinaryService,
        UsersService,
        EmailService,
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
