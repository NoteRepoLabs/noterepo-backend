import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { StorageModule } from '../../storage/storage.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '../../jwt/jwt.service';
import { CookieService } from '../../cookie/cookie.service';

@Module({
  imports: [StorageModule],
  controllers: [FilesController],
  providers: [FilesService, PrismaService, JwtService, CookieService],
})
export class FilesModule { }
