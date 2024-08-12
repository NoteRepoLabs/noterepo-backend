import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailModule } from "../email/email.module";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "../jwt/jwt.service";
import { StorageModule } from "../storage/storage.module";

@Module({
	imports: [PrismaModule, EmailModule, StorageModule],
	controllers: [UsersController],
	providers: [UsersService, PrismaService, JwtService],
	exports: [UsersService],
})
export class UsersModule {}
