import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { JwtService } from "./jwt/jwt.service";
import { SearchService } from "./search/search.service";
import { SearchModule } from "./search/search.module";

describe("AppController", () => {
	let appController: AppController;

	beforeAll(() => {
		process.env.MEILISEARCH_HOST = "http://localhost:7700";
	});

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			imports: [SearchModule],
			controllers: [AppController],
			providers: [AppService, JwtService, SearchService],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	describe("root", () => {
		it('should return "Welcome to Note Repo Api V1', () => {
			expect(appController.getHello()).toEqual({
				message: "Welcome to Note Repo Api V1",
			});
		});
	});
});
