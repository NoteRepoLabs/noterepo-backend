import {
	ConflictException,
	ForbiddenException,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRepoDto } from "./dto/create-repo.dto";
import { CloudinaryService } from "../storage/cloudinary/cloudinary.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { RepoCreatedEvent } from "./events/repo-events";
import { UsersService } from "../users/users.service";

@Injectable()
export class RepoService {
	constructor(
		private readonly userService: UsersService,
		private readonly prisma: PrismaService,
		private readonly cloudinary: CloudinaryService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	async isMaxRepoCount(count: number) {
		// Maximum repo count
		if (count >= 5) {
			return true;
		}
		return false;
	}

	async createRepo(
		userId: string,
		{ name, description, tags, isPublic }: CreateRepoDto,
	) {
		const user = await this.userService.findUserById(userId);

		if (!user) {
			throw new NotFoundException("Cannot create repo, user not found");
		}

		// Check amount of user's repo
		if (this.isMaxRepoCount(user.repoCount)) {
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

	async getAllRepo() {
		const repo = await this.prisma.repo.findMany({});

		if (!repo) {
			throw new HttpException("No Repo Found", HttpStatus.NOT_FOUND);
		}

		return repo;
	}

	async getUserRepo(userId: string) {
		const repo = await this.prisma.repo.findMany({
			where: { user: { id: userId } },
			include: { files: true },
		});

		if (!repo) {
			throw new HttpException(
				"No repo belongs to the user",
				HttpStatus.NOT_FOUND,
			);
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
			//For storing file names
			const fileNames: string[] = [];

			const fileIds: string[] = [];

			repo.files.forEach((file) => fileNames.push(file.publicName));

			repo.files.forEach((file) => fileIds.push(file.id));

			//Delete all files relations to repo and delete repo
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

			//Delete all files from cloudinary, to be implemented
			await this.cloudinary.deleteFiles(fileNames);
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
