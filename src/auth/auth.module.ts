import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '../jwt/jwt.service';
import { CookieService } from '../cookie/cookie.service';
import { EmailModule } from '../email/email.module';
import { JoiPipeModule } from 'nestjs-joi';
import { SearchModule } from '../search/search.module';
import { SearchService } from '../search/search.service';

@Module({
  imports: [PrismaModule, EmailModule, JoiPipeModule, SearchModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, CookieService, SearchService],
})
export class AuthModule { }
