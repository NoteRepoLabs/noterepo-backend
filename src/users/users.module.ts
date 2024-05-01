import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule { }
