export class RepoCreatedEvent {
  id: string;

  name: string;

  description: string;

  isPublic: boolean;

  tags: string[];

  userId: string;

  createdAt: Date;
}
