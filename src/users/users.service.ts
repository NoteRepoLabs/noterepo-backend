import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { generateResetPasswordLink } from '../utils/generateLinks/generateResetPasswordLink';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { v4 as uuid } from 'uuid';
import { CloudinaryService } from '../storage/cloudinary/cloudinary.service';
import { VerificationTokenDto } from './dto/verification.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  async createUser(user: CreateUserDto) {
    return await this.prisma.user.create({
      data: { email: user.email, password: user.password },
    });
  }

  async findUserById(userId: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  async findUserByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  //Development only
  async getAllUsers() {
    const user = await this.prisma.user.findMany();

    return user;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: updateUserDto,
    });
  }

  async verifyUser(verificationToken: VerificationTokenDto) {
    return await this.prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: { isVerified: true },
    });
  }

  async forgetPassword({ email }: ForgetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      throw new NotFoundException('User with email not found.');
    }

    //Generate a reset token
    const resetPassword = await this.prisma.resetPassword.create({
      data: { token: uuid(), userId: user.id },
    });

    const link = generateResetPasswordLink(resetPassword.token);

    await this.email.sendResetPasswordMail(email, link);

    return `Reset password mail has be sent to ${email.replace(/(?<=^.{3})\w+/g, (match) => '*'.repeat(match.length))}`;
  }

  async resetPassword(
    token: string,
    { password, confirmPassword }: ResetPasswordDto,
  ) {
    const resetPassword = await this.prisma.resetPassword.findUnique({
      where: {
        token,
      },
    });

    //If no reset password link
    if (!resetPassword) {
      throw new NotFoundException('User not found');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password does match with confirm password',
      );
    }

    //Hash new password
    const newPassword = await bcrypt.hash(password, 10);

    const updatedUser = this.prisma.user.update({
      where: { id: resetPassword.userId },
      data: { password: newPassword },
    });

    //Delete reset token from db
    await this.prisma.resetPassword.delete({ where: { id: resetPassword.id } });

    return updatedUser;
  }

  //Removes a user
  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = await this.prisma.resetPassword.findUnique({
      where: { userId: id },
    });

    if (resetToken) {
      await this.prisma.resetPassword.delete({ where: { userId: id } });
    }

    const verificationToken = await this.prisma.verification.findUnique({
      where: { userId: id },
    });

    if (verificationToken) {
      await this.prisma.verification.delete({ where: { userId: id } });
    }

    const repos = await this.prisma.repo.findMany({ where: { userId: id } });

    if (repos) {
      const repoIds: string[] = [];

      repos.forEach((repo) => repoIds.push(repo.id));

      const files = await this.prisma.file.findMany({
        where: { repoId: { in: repoIds } },
      });

      if (files) {
        const fileNames: string[] = [];

        files.forEach((file) => fileNames.push(file.publicName));

        await this.cloudinary.deleteFiles(fileNames);

        await this.cloudinary.deleteUserFolder(user.username);

        console.log('User files and folder deleted');
      }
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: id },
        data: { Repo: { deleteMany: {} } },
        include: { Repo: true },
      }),
      this.prisma.user.delete({ where: { id: id } }),
    ]);
    return;
  }

  //Only for prelaunch development purposes and should not be touched.
  async removeAllUsers() {
    await this.prisma.$transaction([
      this.prisma.resetPassword.deleteMany({}),
      this.prisma.verification.deleteMany({}),
      this.prisma.user.deleteMany({}),
    ]);
    return;
  }
}
