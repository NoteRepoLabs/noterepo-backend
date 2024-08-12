import { Module } from "@nestjs/common";
import { FilesService } from "./files.service";
import { FilesController } from "./files.controller";
import { StorageModule } from "../../storage/storage.module";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersModule } from "../../users/users.module";
import { EmailService } from "../../email/email.service";
import { JwtService } from "../../jwt/jwt.service";
import { RepoModule } from "../repo.module";

@Module({
	imports: [StorageModule, UsersModule, RepoModule],
	controllers: [FilesController],
	providers: [FilesService, PrismaService, EmailService, JwtService],
})
export class FilesModule {}
