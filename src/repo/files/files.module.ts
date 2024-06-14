import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { StorageModule } from '../../storage/storage.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from '../../users/users.module';
import { UsersService } from '../../users/users.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from 'src/jwt/jwt.service';

@Module({
  imports: [StorageModule, UsersModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    PrismaService,
    UsersService,
    EmailService,
    JwtService,
  ],
})
export class FilesModule { }
