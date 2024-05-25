import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepoDto } from './dto/create-repo.dto';
import { CloudinaryService } from '../storage/cloudinary/cloudinary.service';

@Injectable()
export class RepoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  async createRepo(
    userId: string,
    { name, description, isPublic }: CreateRepoDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Cannot create repo, user not found');
    }

    const repo = await this.prisma.repo.create({
      data: { name, description, isPublic, user: { connect: { id: userId } } },
      include: { user: false },
    });

    return repo;
  }

  async getAllRepo() {
    const repo = await this.prisma.repo.findMany({});

    if (!repo) {
      throw new HttpException('No Repo Found', HttpStatus.NOT_FOUND);
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
        'No repo belongs to the user',
        HttpStatus.NOT_FOUND,
      );
    }

    return repo;
  }

  async deleteUserRepo(userId: string, repoId: string) {
    const repo = await this.prisma.repo.findUnique({
      where: { id: repoId, userId },
      include: { files: true },
    });

    if (!repo) {
      throw new NotFoundException(
        'Repository not found or does not belong to the user',
      );
    }

    //For storing file names
    const fileNames: string[] = [];

    repo.files.forEach((file) => fileNames.push(file.publicName));

    //Delete all files from cloudinary, to be implemented
    await this.cloudinary.deleteFiles(fileNames);

    //Delete all file relations to repo and delete repo
    await this.prisma.$transaction([
      this.prisma.repo.update({
        where: { id: userId },
        data: { files: { deleteMany: {} } },
        include: { files: true },
      }),
      this.prisma.repo.delete({ where: { id: repoId } }),
    ]);

    return;
  }
  async getBookmarks(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      select: { repoId: true },
    });

    if (!bookmarks) {
      throw new NotFoundException('No bookmarks found');
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
      throw new NotFoundException('No bookmarks found');
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
        'Repository not found or does not belong to the user',
      );
    }

    //If user has files
    if (repo.files.length > 0) {
      //For storing file names
      const fileNames: string[] = [];

      repo.files.forEach((file) => fileNames.push(file.publicName));

      //Delete all file relations to repo and delete repo
      await this.prisma.$transaction([
        this.prisma.repo.update({
          where: { id: repoId },
          data: { files: { deleteMany: {} } },
          include: { files: true },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { Repo: { delete: { id: repoId } } },
        }),
      ]);

      //Delete all files from cloudinary, to be implemented
      await this.cloudinary.deleteFiles(fileNames);
    } else {
      //Delete only the repo
      await this.prisma.user.update({
        where: { id: userId },
        data: { Repo: { delete: { id: repoId } } },
      });
    }

    return;
  }
}
