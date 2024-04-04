import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  INestApplication,
  Logger,
  VersioningType,
} from '@nestjs/common';

import fastifyCookie from '@fastify/cookie';
import { ResponseInterceptor } from './response/response.interceptor';
// import * as morgan from 'morgan';
import { logger } from './utils/requestLogger/request.logger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ ignoreTrailingSlash: true }),
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

  //For request logging
  app.use(logger());

  //Add api prefix to all endpoints
  app.setGlobalPrefix('api');

  //For versioning api
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const HOST = process.env.NODE_ENV === 'development' ? '127.0.0.1' : '0.0.0.0';

  await app.listen(process.env.PORT, HOST);
}

bootstrap().then(() => {
  new Logger('Server').log('Server listening');
});

export function registerGlobals(app: INestApplication) {
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );
}
