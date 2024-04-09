import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from './jwt/jwt.service';
import { CookieService } from './cookie/cookie.service';
import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        PORT: Joi.number().port().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        COOKIE_SECRET: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
    PrismaModule,
    AuthModule,
    EmailModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService, CookieService],
})
export class AppModule {}
