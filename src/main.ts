//Dependencies
import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  ClassSerializerInterceptor,
  INestApplication,
  Logger,
  VersioningType,
} from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

//Imports
import { AppModule } from './app.module';
import { ResponseInterceptor } from './utils/response/response.interceptor';
import { logger } from './utils/requestLogger/request.logger';
import fastifyHelmet from '@fastify/helmet';

async function bootstrap() {
  //Fastify Adapter
  const adapter = new FastifyAdapter({ ignoreTrailingSlash: true });

  //Enable Cors
  adapter.enableCors({
    credentials: true,
    origin: [
      'https://www.noterepo.com.ng',
      'https://noterepo-web.vercel.app',
      'http://localhost:3456',
    ],
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  //Add api prefix to all endpoints
  app.setGlobalPrefix('api');

  //For versioning api
  app.enableVersioning({
    type: VersioningType.URI,
  });

  //swagger configurations
  const config = new DocumentBuilder()
    .setTitle('Note-repo')
    .setDescription('Note-repo Api')
    .setVersion('v1')
    .addServer('http://localhost:3000/', 'Local environment')
    .addServer('https://noterepo.onrender.com', 'Production')
    .addTag('Note Repo Apis')
    .build();

  //Swagger Document
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

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

  //Setup helmet for security
  app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
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
