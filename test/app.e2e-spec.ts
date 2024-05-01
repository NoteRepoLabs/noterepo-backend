import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';

//import { AuthModule } from '../src/auth/auth.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: FastifyAdapter;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    //Reference server instance
    server = app.getHttpServer();
  });

  it('/v1 (GET)', async () => {
    return await request(app.getHttpServer())
      .get('/v1')
      .expect(200)
      .expect({ message: 'Welcome to Note Repo Api V1' });
  });

  afterEach(async () => {
    await app.close();

    server.close();
  });
});
