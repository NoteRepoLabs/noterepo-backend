import { Test, TestingModule } from "@nestjs/testing";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CloudinaryService } from "../../storage/cloudinary/cloudinary.service";
import { StorageModule } from "../../storage/storage.module";
import { JwtService } from "../../jwt/jwt.service";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { UsersModule } from "../../users/users.module";
import { UsersService } from "../../users/users.service";
import { EmailService } from "../../email/email.service";
import { RepoModule } from "../repo.module";

describe("NotesController", () => {
	let controller: FilesController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				StorageModule,
				UsersModule,
				RepoModule,
				EventEmitterModule.forRoot(),
			],
			controllers: [FilesController],
			providers: [
				FilesService,
				PrismaService,
				CloudinaryService,
				JwtService,
				UsersService,
				EmailService,
			],
		}).compile();

		controller = module.get<FilesController>(FilesController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
