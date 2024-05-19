import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../storage/cloudinary/cloudinary.service';

//File types supported
const filetypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

//File field name supported
const fieldNames = ['file'];

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) { }
  async uploadFile(req: FastifyRequest, userId: string, repoId: string) {
    const file = await req.file();

    //Get original file name
    const originalFileName = file.filename;

    //Check if there's a file
    if (!file) {
      throw new BadRequestException('No File Uploaded');
    }

    //Check file field name
    if (!fieldNames.includes(file.fieldname)) {
      throw new BadRequestException('Invalid file field');
    }

    //Check filetype
    if (!filetypes.includes(file.mimetype)) {
      throw new BadRequestException('Filetype not supported');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    //Check if user exist
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }

    const repo = await this.prisma.repo.findUnique({
      where: { id: repoId },
      include: { files: true },
    });

    //Check if repo exists
    if (!repo) {
      throw new NotFoundException("Repo doesn't exist");
    }

    const fileExists = repo.files.find(
      (userFile) => userFile.name === file.filename,
    );

    //Check if the file exists
    if (fileExists) {
      throw new HttpException('File Already Exists', HttpStatus.CONFLICT);
    }

    // Format the filename to be unique for storage
    const timestamp = Date.now();
    const name = file.filename.split('.')[0];
    const type = file.filename.split('.')[1];
    const newFileName = `${name}_${timestamp}.${type}`;

    //Upload file
    const uploadFileResult = await this.cloudinary.uploadFile(
      file,
      newFileName,
      user.username,
    );

    //Store type of fileUrl based on environment
    const fileUrl =
      process.env.NODE_ENV === 'development'
        ? uploadFileResult.url
        : uploadFileResult.secure_url;

    //Store file in db with original file name
    const savedFile = await this.prisma.file.create({
      data: {
        name: originalFileName,
        publicName: uploadFileResult.public_id,
        urlLink: fileUrl,
        repo: { connect: { id: repoId } },
      },
    });

    return savedFile;
  }

  //Delete a file from repo
  async deleteAFile(userId: string, repoId: string, fileId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const repo = await this.prisma.repo.findUnique({
      where: { id: repoId },
      include: { files: true },
    });

    if (!repo) {
      throw new NotFoundException('Repo not found');
    }

    const fileExists = repo.files.find((file) => file.id === fileId);

    if (!fileExists) {
      throw new NotFoundException('File not found');
    }

    //Delete a file from storage bucket
    await this.cloudinary.deleteFile(fileExists.publicName);

    //Disconnect relation and delete file
    await this.prisma.$transaction([
      this.prisma.repo.update({
        where: { id: repoId },
        data: { files: { disconnect: { id: fileId } } },
      }),
      this.prisma.file.delete({ where: { id: fileId } }),
    ]);

    return;
  }

  //Delete multiple files in a repo
  async deleteFiles(userId: string, repoId: string, fileIds: string[]) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const repo = await this.prisma.repo.findUnique({
      where: { id: repoId },
    });

    if (!repo) {
      throw new NotFoundException('Repo not found');
    }

    const files = await this.prisma.file.findMany({
      where: { id: { in: fileIds } },
    });

    if (!files) {
      throw new NotFoundException('Files not found');
    }

    const fileNames: string[] = [];

    //Get the names
    files.forEach((file) => fileNames.push(file.publicName));

    //Delete files from storage bucket
    await this.cloudinary.deleteFiles(fileNames);

    //Disconnect files relations and delete files
    await this.prisma.$transaction([
      this.prisma.repo.update({
        where: { id: repoId },
        data: { files: { deleteMany: { id: { in: fileIds } } } },
        include: { files: true },
      }),
      this.prisma.file.deleteMany({ where: { id: { in: fileIds } } }),
    ]);

    return;
  }
}
