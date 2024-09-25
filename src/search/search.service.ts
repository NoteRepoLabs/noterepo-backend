import { Injectable } from "@nestjs/common";
import { MeiliSearch } from "meilisearch";
import { RepoCreatedEvent } from "../repo/events/repo-events";
import { FileCreatedEvent } from "../repo/files/events/file-events";

@Injectable()
export class SearchService {
	private readonly client: MeiliSearch;
	constructor() {
		this.client = new MeiliSearch({
			host: process.env.MEILISEARCH_HOST,
			apiKey: process.env.MEILISEARCH_ADMIN_KEY,
		});
	}

	async createIndex() {
		try {
			const index1result = await this.client.createIndex("repos", {
				primaryKey: "id",
			});

			/*const index2Result = await this.client.createIndex('files', {
        primaryKey: 'id',
      });*/

			console.log(index1result);
			//console.log(index2Result);
		} catch (err) {
			console.error(err);
		}
	}

	async updateIndexSettings() {
		//Set Repo Search Index Settings
		this.client
			.index("repos")
			.updateSettings({
				searchableAttributes: ["name", "description", "tags"],
			})
			.then((msg) => {
				console.log(msg);
			})
			.catch((err) => {
				console.error(err);
			});

		//Set Files Search Index Settings
		/*this.client
			.index("files")
			.updateSettings({
				searchableAttributes: ["name"],
			})
			.then((msg) => {
				console.error(msg);
			})
			.catch((err) => {
				console.log(err);
			});*/
	}
	async createTenantSearchToken(userId: string): Promise<string> {
		const searchRules = {
			repos: {
				filter: `userId = ${userId}`,
			},
			files: {
				filter: `userId = ${userId}`,
			},
		};

		//Search Tenant Token expiration time
		const expiresAt = new Date(Date.now() + 120 * 60 * 60 * 1000); // 5days

		try {
			//Generate token
			const token = await this.client.generateTenantToken(
				process.env.MEILISEARCH_SEARCH_KEY_UID,
				searchRules,
				{ apiKey: process.env.MEILISEARCH_SEARCH_KEY, expiresAt: expiresAt },
			);

			return token;
		} catch (err) {
			console.error(err);
		}
	}

	async addRepoSearchDocument(data: RepoCreatedEvent[]) {
		try {
			return await this.client.index("repos").addDocuments(data);
		} catch (err) {
			console.error(err);
		}
	}

	async updateRepoSearchDocument(data: RepoCreatedEvent[]) {
		try {
			return await this.client.index("repos").updateDocuments(data);
		} catch (err) {
			console.error(err);
		}
	}

	async deleteRepoSearchDocument(ids: string[]) {
		try {
			return await this.client.index("repos").deleteDocuments(ids);
		} catch (err) {
			console.error(err);
		}
	}

	async addFileSearchDocument(data: FileCreatedEvent[]) {
		try {
			return await this.client.index("files").addDocuments(data);
		} catch (err) {
			console.error(err);
		}
	}

	async deleteFileSearchDocument(data: string[]) {
		try {
			return await this.client.index("files").deleteDocuments(data);
		} catch (err) {
			console.error(err);
		}
	}
}
