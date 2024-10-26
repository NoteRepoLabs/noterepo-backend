import {
	ConflictException,
	ForbiddenException,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../prisma/prisma.service";
import { CloudinaryService } from "../storage/cloudinary/cloudinary.service";
import { UsersService } from "../users/users.service";
import { CreateRepoDto } from "./dto/create-repo.dto";
import { RepoCreatedEvent } from "./events/repo-events";

@Injectable()
export class RepoService {
	constructor(
		private readonly userService: UsersService,
		private readonly prisma: PrismaService,
		private readonly cloudinary: CloudinaryService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	async createRepo(
		userId: string,
		{ name, description, tags, isPublic }: CreateRepoDto,
	) {
		const user = await this.userService.findUserById(userId);

		if (!user) {
			throw new NotFoundException("Cannot create repo, user not found");
		}

		// Check amount of user's repo
		if (user.repoCount >= 5) {
			throw new ForbiddenException("Maximum allowed repos reached");
		}

		// Create repo and update user's repo count
		const [repo, updatedUser] = await this.prisma.$transaction([
			this.prisma.repo.create({
				data: {
					name,
					description,
					isPublic,
					tags,
					user: { connect: { id: userId } },
				},
				include: { user: false },
			}),
			this.prisma.user.update({
				where: { id: userId },
				data: {
					repoCount: {
						increment: 1,
					},
				},
			}),
		]);

		if (repo.isPublic) {
			const repoCreatedEvent = new RepoCreatedEvent();
			repoCreatedEvent.id = repo.id;
			repoCreatedEvent.name = repo.name;
			repoCreatedEvent.tags = repo.tags;
			repoCreatedEvent.isPublic = repo.isPublic;
			repoCreatedEvent.description = repo.description;
			repoCreatedEvent.createdAt = repo.createdAt;
			repoCreatedEvent.userId = updatedUser.id; // User id

			//Add repo to search engine
			await this.eventEmitter.emitAsync("searchRepo.created", [
				repoCreatedEvent,
			]);
		}

		return repo;
	}

	async findRepoById(repoId: string, includeFile: boolean) {
		return await this.prisma.repo.findUnique({
			where: { id: repoId },
			include: { files: includeFile },
		});
	}

	async findRepoByIdAndUserId(
		repoId: string,
		userId: string,
		includeFile: boolean,
	) {
		return await this.prisma.repo.findUnique({
			where: { id: repoId, userId },
			include: { files: includeFile },
		});
	}

	async getAllRepos() {
		const repo = await this.prisma.repo.findMany({});

		if (!repo) {
			throw new HttpException("No Repo Found", HttpStatus.NOT_FOUND);
		}

		return repo;
	}

	async getAllPublicRepos(
		nextCursor: string = "",
		previousCursor: string = "",
		limit: number = 10,
	) {
		const maxLimit = 15;

		// Add one more for cursor
		const repoLimit = Math.min(maxLimit + 1, limit * 1 + 1);

		// Decode cursor based on value passed
		const decodedCursor =
			Buffer.from(nextCursor || previousCursor, "base64").toString("utf-8") ||
			null;

		const cursor =
			nextCursor || previousCursor
				? {
						createdAt: decodedCursor,
					}
				: undefined;

		const repos = await this.prisma.repo.findMany({
			where: { isPublic: true },
			cursor,
			take: previousCursor ? -repoLimit : repoLimit, // if a previousCursor is provided take backwards
			orderBy: { createdAt: "asc" },
		});

		const cursorIdentifier =
			repos.length < repoLimit
				? ""
				: new Date(repos[repoLimit - 1].createdAt).toISOString();

		// Encode the next cursor
		const next_cursor = Buffer.from(cursorIdentifier).toString("base64");

		repos.pop(); // remove the last item used as cursor;

		return {
			results: repos.length,
			data: repos,
			pagination: {
				next_cursor,
				previous_cursor: nextCursor,
				perPage: repoLimit - 1,
			},
		};
	}

	async getAllUserRepos(userId: string) {
		const repo = await this.prisma.repo.findMany({
			where: { user: { id: userId } },
			include: { _count: { select: { files: true } } },
		});

		if (!repo) {
			throw new HttpException(
				"No repo belongs to the user",
				HttpStatus.NOT_FOUND,
			);
		}

		return repo;
	}

	async getUserRepo(userId: string, repoId: string) {
		const repo = await this.prisma.repo.findUnique({
			where: { id: repoId, user: { id: userId } },
			include: { files: true },
		});

		if (!repo) {
			throw new HttpException("Repo not found", HttpStatus.NOT_FOUND);
		}

		return repo;
	}

	async bookmarkRepo(userId: string, repoId: string) {
		const repo = await this.prisma.repo.findUnique({
			where: { id: repoId },
		});

		if (!repo) {
			throw new NotFoundException("Repo not found");
		}

		const isBookmarked = await this.prisma.bookmark.findUnique({
			where: { userId_repoId: { userId, repoId } },
		});

		if (isBookmarked) {
			throw new ConflictException("Repo Already Bookmarked");
		}

		const bookmarked = await this.prisma.bookmark.create({
			data: { repoId, user: { connect: { id: userId } } },
		});

		return bookmarked;
	}

	async unbookmarkRepo(userId: string, repoId: string) {
		const repo = await this.prisma.repo.findUnique({
			where: { id: repoId },
		});

		if (!repo) {
			throw new NotFoundException("Repo not found");
		}

		const isBookmarked = await this.prisma.bookmark.findUnique({
			where: { userId_repoId: { userId, repoId } },
		});

		if (!isBookmarked) {
			throw new NotFoundException("Repo Not Bookmarked");
		}

		await this.prisma.$transaction([
			this.prisma.user.update({
				where: { id: userId },
				data: { bookmarks: { delete: { id: isBookmarked.id } } },
			}),
		]);

		return;
	}

	async getBookmarks(userId: string) {
		const bookmarks = await this.prisma.bookmark.findMany({
			where: { userId },
			select: { repoId: true },
		});

		if (!bookmarks) {
			throw new NotFoundException("No bookmarks found");
		}

		const bookmarkIds: string[] = [];

		bookmarks.forEach((bookmark) => bookmarkIds.push(bookmark.repoId));

		const bookmarkedRepos = await this.prisma.repo.findMany({
			where: { id: { in: bookmarkIds } },
		});

		return bookmarkedRepos;
	}

	async getBookmarksRepoIds(userId: string) {
		const bookmarks = await this.prisma.bookmark.findMany({
			where: { userId },
			select: { repoId: true },
		});

		if (!bookmarks) {
			throw new NotFoundException("No bookmarks found");
		}

		const bookmarkIds: string[] = [];

		bookmarks.forEach((bookmark) => bookmarkIds.push(bookmark.repoId));

		return { repoIds: bookmarkIds };
	}

	async deleteUserRepo(userId: string, repoId: string) {
		const repo = await this.prisma.repo.findUnique({
			where: { id: repoId, userId },
			include: { files: true },
		});

		if (!repo) {
			throw new NotFoundException(
				"Repository not found or does not belong to the user",
			);
		}

		//If user has files
		if (repo.files.length > 0) {
			//Get all raw files name
			const fileNamesRaw: string[] = repo.files
				.filter((file) => file.resourceType == "raw")
				.map((file) => file.publicName);

			//Get all image files name
			const fileNamesImage: string[] = repo.files
				.filter((file) => file.resourceType == "image")
				.map((file) => file.publicName);

			const fileIds: string[] = [];

			repo.files.forEach((file) => fileIds.push(file.id));

			//Delete all files relations to the repo and delete repo
			await this.prisma.$transaction([
				this.prisma.repo.update({
					where: { id: repoId },
					data: { files: { deleteMany: {} } },
					include: { files: true },
				}),
				this.prisma.user.update({
					where: { id: userId },
					data: {
						Repo: { delete: { id: repoId } },
						repoCount: { decrement: 1 },
					},
				}),
			]);

			//Delete Repos from Search Engine
			this.eventEmitter.emitAsync("searchRepo.deleted", [repo.id]);

			//Delete Files from Search Engine
			this.eventEmitter.emitAsync("searchFile.deleted", [fileIds]);

			//Delete all raw files from cloudinary.
			await this.cloudinary.deleteFilesFromStorage(fileNamesRaw, "raw");

			//Delete all files from cloudinary, to be implemented
			await this.cloudinary.deleteFilesFromStorage(fileNamesImage, "image");
		} else {
			//Delete only the repo
			await this.prisma.user.update({
				where: { id: userId },
				data: { Repo: { delete: { id: repoId } }, repoCount: { decrement: 1 } },
			});

			//Delete Repo from Search Engine
			this.eventEmitter.emitAsync("searchRepo.deleted", [repo.id]);
		}

		return;
	}
}
