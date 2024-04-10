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
import { EmailService } from 'src/email/email.service';
import { SetUsernameDto } from './dto/set-username.dto';
import { generateWelcomeLink } from 'src/utils/generateLinks/generateWelcomeLink';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly cookie: CookieService,
    private readonly email: EmailService,
  ) { }

  private logger = new Logger('Authentication Service');

  async signUp(body: SignUpDto) {
    const { email, password } = body;

    //convert emails to lowercase perform operating on it
    email.toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });

    //If user exists
    if (user) {
      throw new BadRequestException('User Already exists');
    }

    //Hash new user password
    const hashPassword = await bcrypt.hash(password, 10);

    // Generate verification id
    const verificationId = uuid();

    // save and return newUser Object
    const newUser = await this.prisma.user.create({
      data: { email, password: hashPassword, verificationId },
    });

    //Send verification link
    this.email.sendVerificationLink(newUser.email, verificationId);

    this.logger.log('User Registered Successfully');

    //Log user id
    this.logger.log({ id: newUser.id });

    return newUser;
  }

  async signIn({ email, password }: SignInDto, res: FastifyReply) {
    //Converting emails to lowercase
    email.toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });

    // If user not found
    if (!user) {
      throw new NotFoundException('User not found');
    }

    //Check if user account is verified
    if (!user.isVerified) {
      //Get user verification id not used yet and Send verification link
      this.email.sendVerificationLink(user.email, user.verificationId);

      throw new UnauthorizedException(
        `Your account is not verified, an email as be sent to ${user.email}`,
      );
    }

    //If user didn't set initial username
    if (user.username === null) {
      //Generate welcome page link
      const welcomeLink = generateWelcomeLink(user.id);

      //Redirect user to the page
      return res.redirect(302, welcomeLink);
    }

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

    this.logger.log({ id: user.id });

    //Return user object
    return user;
  }

  //Basic Implementation. Not complete
  async verifyAccount(id: string) {
    //Find account with the verification id
    const account = await this.prisma.user.findUniqueOrThrow({
      where: {
        verificationId: id,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found or verified');
    }

    //If account found, verify user and set verification id empty
    await this.prisma.user.update({
      where: {
        verificationId: id,
      },
      data: { isVerified: true, verificationId: '' },
    });

    const welcomeLink = generateWelcomeLink(id);

    return welcomeLink;
  }

  async setInitialUsername(id: string, { username }: SetUsernameDto) {
    //Find Account
    const account = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    //Set username
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: { username },
    });

    return user;
  }
}
