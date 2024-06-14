import { Role } from '@prisma/client';

export class UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  isVerified?: boolean;
  role?: Role;
  refresh_token?: string;
}
