import { Exclude } from 'class-transformer';

export class bookmarkResponseDto {
  id: string;

  userId: string;

  repoId: string;

  @Exclude()
  user: unknown;

  @Exclude()
  createdAt: Date;
}

export class bookmarkRepoIdsResponseDto {
  repoIds: string[];
}
