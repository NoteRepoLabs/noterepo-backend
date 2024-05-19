import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepoDto } from './dto/create-repo.dto';

@Injectable()
export class RepoService {
  constructor(private readonly prisma: PrismaService) { }

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
    });

    if (!repo) {
      throw new NotFoundException(
        'Repository not found or does not belong to the user',
      );
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { Repo: { disconnect: { id: repoId } } },
      }),
      this.prisma.repo.delete({ where: { id: repoId } }),
    ]);

    return;
  }
}
