import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { generateResetPasswordLink } from 'src/utils/generateLinks/generateResetPasswordLink';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';

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

    const link = generateResetPasswordLink(user.id);

    await this.email.sendResetPasswordMail(email, link);

    return `Reset password mail has be sent to ${email.replace(/(?<=^.{3})\w+/g, (match) => '*'.repeat(match.length))}`;
  }

  async resetPassword(
    id: string,
    { password, confirmPassword }: ResetPasswordDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password does match with confirm password',
      );
    }

    const newPassword = await bcrypt.hash(password, 10);

    const updatedUser = this.prisma.user.update({
      where: { id },
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
