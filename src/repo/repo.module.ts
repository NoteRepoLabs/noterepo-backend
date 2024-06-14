import { Module } from '@nestjs/common';
import { RepoService } from './repo.service';
import { RepoController } from './repo.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from 'src/jwt/jwt.service';
import { StorageModule } from 'src/storage/storage.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [RepoController],
  providers: [RepoService, JwtService, UsersService, EmailService],
  imports: [PrismaModule, StorageModule, UsersModule],
})
export class RepoModule { }
