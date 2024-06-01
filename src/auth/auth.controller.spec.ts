import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '../jwt/jwt.service';
import { CookieService } from '../cookie/cookie.service';
import { EmailService } from '../email/email.service';
import { prismaService } from '../../test/setupTests.e2e';
import { FastifyReply } from 'fastify';
import { UnauthorizedException } from '@nestjs/common';
import { SearchService } from '../search/search.service';

describe('AuthController', () => {
  let controller: AuthController;
  let res: FastifyReply;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        PrismaService,
        JwtService,
        CookieService,
        EmailService,
        SearchService,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Should Create User', async () => {
    const user = { email: 'example123@gmail.com', password: '123456789' };

    const newUser = await controller.signUp(user);

    expect(newUser.email).toBe(user.email);
    expect(newUser.isVerified).toBe(false);
    expect(newUser.username).toBeNull();
    expect(newUser.role).toBe('USER');
  });

  it('Should not sign in user', async () => {
    const body = { email: 'example123@gmail.com', password: '123456789' };

    await expect(controller.signIn(body, res)).rejects.toEqual(
      new UnauthorizedException(
        'Your account is not verified, an email as be sent to exa*******@gmail.com',
      ),
    );
  });
});
