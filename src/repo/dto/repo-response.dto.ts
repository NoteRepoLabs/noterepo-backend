import { Exclude } from "class-transformer";

/*
For excluding some fields in response object eg password
*/
export class ReposResponseDto {
	id: string;

	name: string;

	description: string;

	@Exclude()
	user: unknown;

	isPublic: boolean;

	tags: string[];

	createdAt: Date;

	_count: { files: number };

	@Exclude()
	updatedAt: Date;
}

export class RepoResponseDto {
	id: string;

	name: string;

	description: string;

	@Exclude()
	user: unknown;

	isPublic: boolean;

	files: unknown;

	tags: string[];

	createdAt: Date;

	@Exclude()
	updatedAt: Date;
}
