import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '../jwt/jwt.service';
import { EmailModule } from '../email/email.module';
import { JoiPipeModule } from 'nestjs-joi';
import { SearchModule } from '../search/search.module';
import { SearchService } from '../search/search.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from 'src/users/users.service';
import { CloudinaryService } from 'src/storage/cloudinary/cloudinary.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    EmailModule,
    JoiPipeModule,
    SearchModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    SearchService,
    UsersService,
    CloudinaryService,
  ],
})
export class AuthModule { }
