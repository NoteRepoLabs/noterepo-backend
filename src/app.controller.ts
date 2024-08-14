import { Controller, Get, Post, Put, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "./guards/auth.guards";
import { SearchService } from "./search/search.service";

@ApiTags("Version")
@Controller("v1")
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly searchEngine: SearchService,
	) {}

	@ApiResponse({ status: 200, description: "Welcome to Note Repo Api V1" })
	@Get()
	getHello(): object {
		return this.appService.getHello();
	}

	@ApiResponse({ status: 200, description: "returns server's health status" })
	@Get("/health")
	checkHealth() {
		return this.appService.checkHealth();
	}

	@ApiResponse({
		status: 200,
		description: "Returns user's authentication status",
	})
	@UseGuards(AuthGuard)
	@Get("/check-session")
	checkSession(): string {
		return this.appService.checkSession();
	}

	@Get("/debug-sentry")
	getError() {
		throw new Error("My first Sentry error!");
	}

	@Post("/create-search-index")
	async createSearchIndex() {
		await this.searchEngine.createIndex();
		return { message: "Search Index Created" };
	}

	@Put("/update-search-index")
	async updateSearchEngine() {
		await this.searchEngine.updateIndexSettings();
		return { message: "Search Index setting Updated" };
	}
}
