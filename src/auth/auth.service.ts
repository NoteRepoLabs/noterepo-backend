import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
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
import { FastifyReply } from 'fastify';
import { EmailService } from '../email/email.service';
import { SetUsernameDto } from './dto/set-username.dto';
import { generateWelcomeLink } from '../utils/generateLinks/generateWelcomeLink';
import { v4 as uuid } from 'uuid';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly email: EmailService,
  ) { }

  private logger = new Logger('Authentication Service');

  async signUp(body: SignUpDto) {
    const { email, password } = body;

    //Convert mail to lowercase
    const lowercaseEmail = email.toLowerCase();

    const user = await this.userService.findUserByEmail(lowercaseEmail);
    //If user exists
    if (user) {
      throw new BadRequestException('User already exists.');
    }

    //Hash new user password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save and return newUser Object
    const newUser = await this.userService.createUser({
      email: lowercaseEmail,
      password: hashedPassword,
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

    const user = await this.userService.findUserByEmail(lowercaseEmail);

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

    //Generate Jwt access token and refresh tokenfrom jwt service
    const token = await this.getTokens(user.id);

    //Add user's refresh token to database
    await this.updateRefreshToken(user.id, token.refresh_token);

    this.logger.log('User signed in successfully');

    this.logger.log({ id: user.id });

    //Return user object
    return { ...user, ...token };
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
    const user = await this.userService.verifyUser({
      userId: verificationToken.userId,
    });

    //Delete token
    await this.prisma.verification.delete({
      where: { id: verificationToken.id },
    });

    //Generate Set username/welcome link
    const welcomeLink = generateWelcomeLink(user.id);

    return welcomeLink;
  }

  async setInitialUsername(userId: string, { username }: SetUsernameDto) {
    //Check if user name exists already
    const name = await this.userService.findUserByUsername(username);

    if (name) {
      throw new HttpException('Username Already Exists', HttpStatus.CONFLICT);
    }

    //Find Account
    const account = await this.userService.findUserById(userId);

    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    //Check if username is already set
    if (account.username !== null) {
      throw new BadRequestException('Username already set');
    }

    //Set username
    const user = await this.userService.updateUser(userId, { username });

    //Generate Jwt access and refresh token  from jwt service
    const token = await this.getTokens(user.id);

    //Hash and add user's refresh token to database
    await this.updateRefreshToken(user.id, token.refresh_token);

    this.logger.log('Username set successfully.');

    return { ...user, ...token };
  }

  async getTokens(userId: string) {
    const [access_token, refresh_token] = await Promise.all([
      await this.jwtService.signAccessToken({ id: userId }),
      await this.jwtService.signRefreshToken({ id: userId }),
    ]);

    return { access_token, refresh_token };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    return await this.userService.updateUser(userId, {
      refresh_token: refreshToken,
    });
  }

  async refreshToken(userId: string) {
    const user = await this.userService.findUserById(userId);

    if (!user || !user.refresh_token)
      throw new ForbiddenException('Access Denied');

    //Generate new access token and
    const access_token = await this.jwtService.signAccessToken({ id: userId });
    const refresh_token = user.refresh_token;

    return { access_token, refresh_token };
  }

  async signOut(userId: string) {
    const user = await this.userService.findUserById(userId);

    if (!user) throw new NotFoundException('User Not Found');

    await this.userService.updateUser(userId, { refresh_token: null });

    return;
  }
}
