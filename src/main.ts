import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  INestApplication,
  VersioningType,
} from '@nestjs/common';

import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  //Needed for response dtos to function
  registerGlobals(app);

  //Adding cookie support to fatisfy
  app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {
      path: '/',
    },
  });

  //Add api prefix to all endpoints
  app.setGlobalPrefix('api');

  //For versioning api
  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(process.env.PORT);
}
bootstrap();

export function registerGlobals(app: INestApplication) {
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
}
