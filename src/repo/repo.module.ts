import { Module } from "@nestjs/common";
import { RepoService } from "./repo.service";
import { RepoController } from "./repo.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtService } from "../jwt/jwt.service";
import { StorageModule } from "../storage/storage.module";
import { UsersModule } from "../users/users.module";
import { UsersService } from "../users/users.service";
import { EmailService } from "../email/email.service";

@Module({
	controllers: [RepoController],
	providers: [RepoService, JwtService, UsersService, EmailService],
	imports: [PrismaModule, StorageModule, UsersModule],
	exports: [RepoService],
})
export class RepoModule {}
