import { Exclude } from 'class-transformer';

/*
For excluding some fields in response object eg password
*/
export class RepoResponseDto {
  id: number;

  name: string;

  description: string;

  @Exclude()
  user: unknown;

  isPublic: boolean;

  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
