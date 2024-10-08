// Import this first!
import "./sentry/instrument";

//Dependencies
import fastifyCookie from "@fastify/cookie";
import {
	ClassSerializerInterceptor,
	INestApplication,
	Logger,
	VersioningType,
} from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

//Imports
import fastifyHelmet from "@fastify/helmet";
import multiPart from "@fastify/multipart";
import { AppModule } from "./app.module";
import { logger } from "./utils/requestLogger/request.logger";
import { CustomExceptionFilter } from "./utils/response/httpException.filter";
import { SearchService } from "./search/search.service";

async function bootstrap() {
	//Fastify Adapter
	const adapter = new FastifyAdapter({ ignoreTrailingSlash: true });

	//Enable Cors
	adapter.enableCors({
		credentials: true,
		origin: [
			"https://www.noterepo.com.ng",
			"https://noterepo-web.vercel.app",
			"http://localhost:3456",
		],
		methods: "GET,HEAD,POST,PATCH,DELETE,PUT",
	});

	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		adapter,
	);

	//Add api prefix to all endpoints
	app.setGlobalPrefix("api");

	//For versioning api
	app.enableVersioning({
		type: VersioningType.URI,
	});

	//swagger configurations
	const config = new DocumentBuilder()
		.setTitle("Note-repo")
		.setDescription("Note-repo Api")
		.setVersion("v1")
		.addServer("http://localhost:3000/", "Local environment")
		.addServer("https://noterepo.onrender.com", "Production")
		.addTag("Note Repo Apis")
		.addBearerAuth(
			{ type: "http", scheme: "bearer", bearerFormat: "JWT" },
			"access-token",
		)
		.addBearerAuth(
			{ type: "http", scheme: "bearer", bearerFormat: "JWT" },
			"refresh-token",
		)
		.build();

	//Swagger Document
	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup("api", app, document);

	//Needed for response dtos to function
	registerGlobals(app);

	//Adding cookie support to fatisfy
	app.register(fastifyCookie, {
		secret: process.env.COOKIE_SECRET,
		parseOptions: {
			path: "/",
		},
	});

	//For request file processing
	await app.register(multiPart, { limits: { fileSize: 10485760 } }); //filesize limit of 80MB

	//For request logging
	app.use(logger());

	//Setup helmet for security
	app.register(fastifyHelmet, {
		contentSecurityPolicy: {
			directives: {
				defaultSrc: [`'self'`],
				styleSrc: [`'self'`, `'unsafe-inline'`],
				imgSrc: [`'self'`, "data:", "validator.swagger.io"],
				scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
			},
		},
	});

  //Update search engine in prod
  if(process.env.NODE_ENV=== "production"){
    const searchService = new SearchService()
    await searchService.createIndex()
    await searchService.updateIndexSettings()
  }

	const HOST = process.env.NODE_ENV === "development" ? "127.0.0.1" : "0.0.0.0";

	await app.listen(process.env.PORT, HOST);
}

bootstrap().then(() => {
	new Logger("Server").log("Server listening");
});

export function registerGlobals(app: INestApplication) {
	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
	app.useGlobalFilters(new CustomExceptionFilter());
}
