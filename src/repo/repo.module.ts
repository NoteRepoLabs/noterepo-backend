import { Module } from '@nestjs/common';
import { RepoService } from './repo.service';
import { RepoController } from './repo.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [RepoController],
  providers: [RepoService],
  imports: [PrismaModule],
})
export class RepoModule { }
