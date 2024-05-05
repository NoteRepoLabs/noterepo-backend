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

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) { }

  //Development only
  async getAllUsers() {
    const user = await this.prisma.user.findMany();

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} ${updateUserDto} user`;
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

    return updatedUser;
  }

  //Removes a user
  async remove(id: string) {
    await this.prisma.user.delete({ where: { id: id } });
    return;
  }

  //Only for prelaunch development purposes and should not be touched.
  async removeAllUsers() {
    await this.prisma.user.deleteMany({});
    return;
  }
}
