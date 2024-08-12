import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { PrismaService } from "../../prisma/prisma.service";
import { CloudinaryService } from "../../storage/cloudinary/cloudinary.service";
import { FileCreatedEvent } from "./events/file-events";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UsersService } from "../../users/users.service";
import { RepoService } from "../repo.service";

//File types supported
const filetypes = [
	"image/jpeg",
	"image/png",
	"application/pdf",
	"application/vnd.ms-powerpoint",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

//File field name supported
const fieldNames = ["file"];

@Injectable()
export class FilesService {
	constructor(
		private readonly userService: UsersService,
		private readonly repoService: RepoService,
		private readonly prisma: PrismaService,
		private readonly cloudinary: CloudinaryService,
		private readonly eventEmitter: EventEmitter2,
	) {}
	async uploadFile(req: FastifyRequest, userId: string, repoId: string) {
		const file = await req.file();

		//Check if there's a file
		if (!file) {
			throw new BadRequestException("No File Uploaded");
		}

		//Get original file name
		const originalFileName = file.filename;

		//Check file field name
		if (!fieldNames.includes(file.fieldname)) {
			throw new BadRequestException("Invalid file field");
		}

		//Check filetype
		if (!filetypes.includes(file.mimetype)) {
			throw new BadRequestException("Filetype not supported");
		}

		const user = await this.userService.findUserById(userId);

		//Check if user exist
		if (!user) {
			throw new NotFoundException("User doesn't exist");
		}

		const repo = await this.repoService.findRepoByIdAndUserId(
			repoId,
			userId,
			true,
		);

		//Check if repo exists
		if (!repo) {
			throw new NotFoundException("Repo doesn't exist");
		}

		const fileExists = repo.files.find(
			(userFile) => userFile.name === file.filename,
		);

		//Check if the file exists
		if (fileExists) {
			throw new HttpException("File Already Exists", HttpStatus.CONFLICT);
		}

		// Format the filename to be unique for storage
		const timestamp = Date.now();
		const name = file.filename.split(".")[0];
		//const type = file.filename.split('.')[1];
		const newFileName = `${name}_${timestamp}`;

		//Upload file
		const uploadFileResult = await this.cloudinary.saveFileToStorage(
			file,
			newFileName,
			user.username,
		);

		//Store type of fileUrl based on environment
		const fileUrl =
			process.env.NODE_ENV === "development"
				? uploadFileResult.url
				: uploadFileResult.secure_url;

		//Store file in db with original file name
		const savedFile = await this.prisma.file.create({
			data: {
				name: originalFileName,
				publicName: uploadFileResult.public_id,
				urlLink: fileUrl,
				repo: { connect: { id: repoId } },
				userId,
			},
		});

		const fileCreatedEvent = new FileCreatedEvent();
		fileCreatedEvent.id = savedFile.id;
		fileCreatedEvent.name = savedFile.name;
		fileCreatedEvent.publicName = savedFile.publicName;
		fileCreatedEvent.urlLink = savedFile.urlLink;
		fileCreatedEvent.createdAt = savedFile.createdAt;
		fileCreatedEvent.repoId = savedFile.repoId;
		fileCreatedEvent.userId = savedFile.userId;

		//Add File To Search Engine
		await this.eventEmitter.emitAsync("searchFile.created", [fileCreatedEvent]);

		return savedFile;
	}

	//Delete a file from repo
	async deleteAFile(userId: string, repoId: string, fileId: string) {
		const user = await this.userService.findUserById(userId);

		if (!user) {
			throw new NotFoundException("User not found");
		}

		const repo = await this.repoService.findRepoByIdAndUserId(
			repoId,
			userId,
			true,
		);

		if (!repo) {
			throw new NotFoundException("Repo not found");
		}

		const fileExists = repo.files.find((file) => file.id === fileId);

		if (!fileExists) {
			throw new NotFoundException("File not found");
		}

		await this.prisma.repo.update({
			where: { id: repoId },
			data: { files: { delete: { id: fileId } } },
		});

		//Delete file from search engine
		await this.eventEmitter.emitAsync("searchFile.deleted", [fileId]);

		//Delete a file from storage bucket
		await this.cloudinary.deleteFileFromStorage(fileExists.publicName);

		return;
	}

	//Delete multiple files in a repo
	async deleteFiles(userId: string, repoId: string, fileIds: string[]) {
		const user = await this.userService.findUserById(userId);

		if (!user) {
			throw new NotFoundException("User not found");
		}

		const repo = await this.prisma.repo.findUnique({
			where: { id: repoId },
		});

		if (!repo) {
			throw new NotFoundException("Repo not found");
		}

		const files = await this.prisma.file.findMany({
			where: { id: { in: fileIds } },
		});

		if (!files) {
			throw new NotFoundException("Files not found");
		}

		const fileNames: string[] = [];

		//Get the names
		files.forEach((file) => fileNames.push(file.publicName));

		//Disconnect files relations and delete files
		await this.prisma.$transaction([
			this.prisma.repo.update({
				where: { id: repoId },
				data: { files: { deleteMany: { id: { in: fileIds } } } },
				include: { files: true },
			}),
			this.prisma.file.deleteMany({ where: { id: { in: fileIds } } }),
		]);

		//Delete file from search engine
		await this.eventEmitter.emitAsync("searchFile.deleted", fileIds);

		//Delete files from storage bucket
		await this.cloudinary.deleteFilesFromStorage(fileNames);

		return;
	}
}
