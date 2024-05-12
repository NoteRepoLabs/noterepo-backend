import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '../jwt/jwt.service';
import { CookieService } from '../cookie/cookie.service';
import { FastifyReply } from 'fastify';
import { EmailService } from '../email/email.service';
import { SetUsernameDto } from './dto/set-username.dto';
import { generateWelcomeLink } from '../utils/generateLinks/generateWelcomeLink';
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

    //Convert mail to lowercase
    const lowercaseEmail = email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: lowercaseEmail },
    });

    //If user exists
    if (user) {
      throw new BadRequestException('User already exists.');
    }

    //Hash new user password
    const hashPassword = await bcrypt.hash(password, 10);

    // save and return newUser Object
    const newUser = await this.prisma.user.create({
      data: { email: lowercaseEmail, password: hashPassword },
    });

    //Store token in verification table
    const verificationId = await this.prisma.verification.create({
      data: { token: uuid(), userId: newUser.id },
    });

    //Send verification link with verificationId generated automatically by the database
    this.email.sendVerificationMail(newUser.email, verificationId.token);

    this.logger.log('User registered successfully.');

    //Log user id
    this.logger.log({ id: newUser.id });

    return newUser;
  }

  async signIn({ email, password }: SignInDto, res: FastifyReply) {
    //Converting emails to lowercase
    const lowercaseEmail = email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: lowercaseEmail },
    });

    // If user not found
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    //Check if user account is verified
    if (!user.isVerified) {
      //Get token from verification table
      const verification = await this.prisma.verification.findUnique({
        where: { userId: user.id },
      });

      //Get user verification id not used yet and Send verification link
      this.email.sendVerificationMail(user.email, verification.token);

      throw new UnauthorizedException(
        `Your account is not verified, an email as be sent to ${user.email.replace(/(?<=^.{3})\w+/g, (match) => '*'.repeat(match.length))}`,
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
      throw new UnauthorizedException('Email or password not correct.');
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

  //Verify Account
  async verifyAccount(token: string, res: FastifyReply) {
    //Find account with the verification id
    const verificationToken = await this.prisma.verification.findUnique({
      where: {
        token,
      },
    });

    //If token is not found, then user is verified, redirect to signin page
    if (!verificationToken) {
      return res.redirect(302, process.env.SIGN_IN_LINK);
    }

    //If token found, verify user
    const user = await this.prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: { isVerified: true },
    });

    //Delete token
    await this.prisma.verification.delete({
      where: { id: verificationToken.id },
    });

    //Generate Set username/welcome link
    const welcomeLink = generateWelcomeLink(user.id);

    return welcomeLink;
  }

  async setInitialUsername(
    id: string,
    { username }: SetUsernameDto,
    res: FastifyReply,
  ) {
    //Check if user name exists already
    const name = await this.prisma.user.findUnique({
      where: { username },
    });

    if (name) {
      throw new BadRequestException('Username Already Exists');
    }

    //Find Account
    const account = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    //Check if username is already set
    if (account.username !== null) {
      throw new BadRequestException('Username already set');
    }

    //Set username
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: { username },
    });

    //Generate Jwt token from jwt service
    const token = await this.jwt.sign({ id: user.id });

    //set cookie header
    this.cookie.sendCookie(token, res);

    this.logger.log('Username set successfully.');

    return user;
  }
}
