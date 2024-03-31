import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaService } from 'src/prisma/prisma.service';
//import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private logger = new Logger('Authentication Service');

  async signUp(body: SignUpDto) {
    const { email, password } = body;

    console.log(password);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      throw new BadRequestException('User Already exists');
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: { email, password: hashPassword },
    });

    this.logger.log('User Registered successfully');
    this.logger.log(newUser);

    return newUser;
  }
}
