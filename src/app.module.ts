import { Module } from "@nestjs/common";
import { SentryModule } from "@sentry/nestjs/setup";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { JwtService } from "./jwt/jwt.service";
import { EmailModule } from "./email/email.module";
import { UsersModule } from "./users/users.module";
import * as Joi from "joi";
import {
	ThrottlerModule,
	minutes,
	seconds,
	ThrottlerGuard,
} from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { RepoModule } from "./repo/repo.module";
import { StorageModule } from "./storage/storage.module";
import { FilesModule } from "./repo/files/files.module";
import { SearchModule } from "./search/search.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { SearchService } from "./search/search.service";
import { ResponseInterceptor } from "./utils/response/response.interceptor";

@Module({
	imports: [
		SentryModule.forRoot(),
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid("development", "production", "test")
					.default("development")
					.required(),
				PORT: Joi.number().port().default(3000),
				DATABASE_URL: Joi.string().required(),
				JWT_ACCESS_SECRET: Joi.string().required(),
				JWT_ACCESS_EXPIRATION_TIME: Joi.string().required(),
				JWT_REFRESH_SECRET: Joi.string().required(),
				JWT_REFRESH_EXPIRATION_TIME: Joi.string().required(),
				WELCOME_LINK: Joi.string().required(),
				SIGN_IN_LINK: Joi.string().required(),
				RESET_PASSWORD_LINK: Joi.string().required(),
				MAILGUN_API_KEY: Joi.string().required(),
				TEST_MAILGUN_API_KEY: Joi.string().required(),
				NOTEREPO_MAIL: Joi.string().required(),
				MAIL_DOMAIN: Joi.string().required(),
				TEST_MAIL_DOMAIN: Joi.string().required(),
				REDIS_URI: Joi.string().required(),
				CLOUD_NAME: Joi.string().required(),
				CLOUDINARY_API_KEY: Joi.string().required(),
				CLOUDINARY_SECRET: Joi.string().required(),
				MEILISEARCH_MASTER_KEY: Joi.string().required(),
				MEILISEARCH_HOST: Joi.string().required(),
				MEILISEARCH_ADMIN_KEY: Joi.string().required(),
				MEILISEARCH_SEARCH_KEY: Joi.string().required(),
				MEILISEARCH_SEARCH_KEY_UID: Joi.string().required(),
			}),
			validationOptions: {
				abortEarly: false,
			},
		}),
		ThrottlerModule.forRoot({
			//Rate limiting
			throttlers: [
				{ limit: 10, ttl: seconds(60) },
				{ limit: 100, ttl: minutes(30) },
			],

			// connection url
			storage: new ThrottlerStorageRedisService(process.env.REDIS_URI),
		}),
		PrismaModule,
		AuthModule,
		EmailModule,
		UsersModule,
		RepoModule,
		StorageModule,
		FilesModule,
		SearchModule,
		EventEmitterModule.forRoot(),
	],
	controllers: [AppController],
	providers: [
		AppService,
		JwtService,
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseInterceptor,
		},
		SearchService,
	],
})
export class AppModule {}
