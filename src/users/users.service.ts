import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }
  // findAll() {
  //   return `This action returns all users`;
  // }
  //
  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }
  //

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} ${updateUserDto} user`;
  }

  //Removes a user
  async remove(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return;
  }

  //Only for prelaunch development purposes and should not be touched.
  async removeAllUsers() {
    await this.prisma.user.deleteMany();
    return;
  }
}
