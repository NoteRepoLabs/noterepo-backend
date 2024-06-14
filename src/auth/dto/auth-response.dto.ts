import { Exclude } from 'class-transformer';

/*
For excluding some fields in response object eg password
*/
export class AuthResponseDto {
  id: number;

  username: string;

  email: string;

  @Exclude()
  password: string;

  isVerified: boolean;

  role: Role;

  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  access_token: string;

  refresh_token: string;

  search_token: string;
}

export enum Role {
  USER,
  ADMIN,
}
