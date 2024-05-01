import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '../jwt/jwt.service';
import { CookieService } from '../cookie/cookie.service';
import { EmailModule } from '../email/email.module';
import { JoiPipeModule } from 'nestjs-joi';

@Module({
  imports: [PrismaModule, EmailModule, JoiPipeModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, CookieService],
})
export class AuthModule { }
