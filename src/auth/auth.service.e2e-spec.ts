import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { postgresClient, prismaService } from '../../test/setupTests.e2e';

describe('authService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should create a user', async () => {
    // Start a transaction
    await postgresClient.query('BEGIN');

    try {
      const newUser = await service.signUp({
        email: 'example@gmail.com',
        password: '12345678',
      });

      // Commit the transaction
      await postgresClient.query('COMMIT');

      // Query the database for the newly created user
      const result = await postgresClient.query(
        'SELECT * FROM "public"."User"',
      );

      // Log the results
      console.log(result.rows);

      expect(newUser).toEqual({ email: 'example@gmail.com' });
    } catch (error) {
      // Rollback the transaction in case of an error
      await postgresClient.query('ROLLBACK');
      throw error;
    }
  });
});
