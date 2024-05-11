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
}

enum Role {
  USER,
  ADMIN,
}
