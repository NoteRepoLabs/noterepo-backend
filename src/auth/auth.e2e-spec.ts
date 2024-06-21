import { INestApplication } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '../jwt/jwt.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaService } from '../../test/setupTests.e2e';
import * as request from 'supertest';
import { AuthService } from './auth.service';
import { SearchService } from '../search/search.service';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from '../storage/cloudinary/cloudinary.service';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { emailService } from '../email/email.mock';

let mailpitContainer: StartedTestContainer;
describe('AuthController', () => {
  let controller: AuthController;
  let app: INestApplication;

  beforeAll(() => {
  beforeAll(async () => {
    process.env.MEILISEARCH_HOST = 'http://localhost:7700';

    // Start Mailpit for capturing mails locally
    mailpitContainer = await new GenericContainer('axllent/mailpit')
      .withName('mailpit')
      .withExposedPorts(
        { container: 8025, host: 8025 },
        { container: 1025, host: 1025 },
      )
      .withStartupTimeout(120000)
      .start();

    // Get the mapped ports for accessing the services
    const uiPort = mailpitContainer.getMappedPort(8025);
    const smtpPort = mailpitContainer.getMappedPort(1025);

    console.log(`Mailpit UI is running on port ${uiPort}`);
    console.log(`Mailpit SMTP is running on port ${smtpPort}`);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        PrismaService,
        EmailService,
        SearchService,
        UsersService,
        CloudinaryService,
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
