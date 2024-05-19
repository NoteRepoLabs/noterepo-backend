import { Module } from '@nestjs/common';
import { RepoService } from './repo.service';
import { RepoController } from './repo.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from 'src/jwt/jwt.service';
import { CookieService } from 'src/cookie/cookie.service';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  controllers: [RepoController],
  providers: [RepoService, JwtService, CookieService],
  imports: [PrismaModule, StorageModule],
})
export class RepoModule { }
