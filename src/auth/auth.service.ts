import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { CookieService } from 'src/cookie/cookie.service';
import { FastifyReply } from 'fastify';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly cookie: CookieService,
  ) {}

  private logger = new Logger('Authentication Service');

  async signUp(body: SignUpDto) {
    if (!body) {
      throw new BadRequestException('No Request Body');
    }

    const { email, password } = body;

    const user = await this.prisma.user.findUnique({ where: { email } });

    //If user exists
    if (user) {
      throw new BadRequestException('User Already exists');
    }

    //Hash new user password
    const hashPassword = await bcrypt.hash(password, 10);

    // save and return newUser Object
    const newUser = await this.prisma.user.create({
      data: { email, password: hashPassword },
    });

    this.logger.log('User Registered Successfully');
    //Log user id
    this.logger.log({ id: newUser.id });

    return newUser;
  }

  async signIn({ email, password }: SignInDto, res: FastifyReply) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // If user not found
    if (!user) {
      throw new NotFoundException('email or password not correct');
    }

    //Check if user account is verified
    // if (!user.isVerified) {
    //   throw new UnauthorizedException('Your account is not verified');
    // }

    const validatePassword = await bcrypt.compare(password, user.password);

    //if password is not valid
    if (!validatePassword) {
      throw new UnauthorizedException('email or password not correct');
    }

    //Generate Jwt token from jwt service
    const token = await this.jwt.sign({ id: user.id });

    //set cookie header
    this.cookie.sendCookie(token, res);

    this.logger.log('User signed in successfully');

    //Return user object
    return user;
  }
}
