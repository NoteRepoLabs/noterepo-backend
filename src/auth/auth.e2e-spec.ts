import { INestApplication } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { CookieService } from '../cookie/cookie.service';
import { JwtService } from '../jwt/jwt.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaService } from '../../test/setupTests.e2e';
import * as request from 'supertest';
import { AuthService } from './auth.service';
import { SearchService } from '../search/search.service';

describe('AuthController', () => {
  let controller: AuthController;
  let app: INestApplication;

  beforeAll(() => {
    process.env.MEILISEARCH_HOST = 'http://localhost:7700';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        CookieService,
        JwtService,
        PrismaService,
        EmailService,
        SearchService,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    controller = module.get<AuthController>(AuthController);

    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('/auth/sign-up (POST)', async () => {
    const userRequest = { email: 'manuel234@gmail.com', password: 'anonymous' };

    const response = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(userRequest)
      .expect(201);

    expect(response.body.email).toBe(userRequest.email);
    expect(response.body.role).toBe('USER');
    expect(response.body.isVerified).toBe(false);
    expect(response.body.username).toBe(null);
    expect(response.body.password).toBe(undefined);
    expect(response.body.updatedAt).toBe(undefined);
  });

  it('/auth/sign-in', async () => {
    const userRequest = { email: 'manuel234@gmail.com', password: 'anonymous' };

    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send(userRequest)
      .expect(401);

    console.log(response.body);

    expect(response.body).toBeDefined();
    expect(response.body.message).toBe(
      'Your account is not verified, an email as be sent to man******@gmail.com',
    );
    expect(response.body.error).toBe('Unauthorized');
    expect(response.body.statusCode).toBe(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
