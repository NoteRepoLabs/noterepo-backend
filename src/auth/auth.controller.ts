import {
  Controller,
  Post,
  Get,
  Body,
  UsePipes,
  Res,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, signUpSchema } from './dto/sign-up.dto';
import { AuthValidationPipe } from '../utils/pipes/validation.pipe';
import { SignInDto, signInSchema } from './dto/sign-in.dto';
import { FastifyReply } from 'fastify';
import { AuthResponseDto } from './dto/auth-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SetUsernameDto } from './dto/set-username.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { RefreshAuthGuard } from '../guards/refreshGuard.guards';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' }) // Auth version 1 controller
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @ApiOperation({ summary: 'Register a new user' })
  @Post('sign-up')
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    type: SignUpDto,
    description: 'Json structure for user object',
  })
  @UsePipes(new AuthValidationPipe(signUpSchema)) // Request body Validation
  async signUp(@Body() body: SignUpDto): Promise<AuthResponseDto> {
    //Get response from service
    const response = await this.authService.signUp(body);

    /**  Maps response dto to response from the service, thereby excluding fields from dto **/
    return plainToInstance(AuthResponseDto, response);
  }

  @ApiOperation({ summary: 'Sign in user' })
  @HttpCode(200)
  @Post('sign-in')
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'User not verified' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    type: SignInDto,
    description: 'Json structure for user object',
  })
  @UsePipes(new AuthValidationPipe(signInSchema)) // Request body Validation
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<AuthResponseDto> {
    //Get Response from service
    const response = await this.authService.signIn(body, res);

    /**  Maps response dto to response from the service, thereby excluding fields from dto **/
    return plainToInstance(AuthResponseDto, response);
  }

  @ApiOperation({ summary: 'Verify user account' })
  @Get('verifyAccount/:userId')
  @ApiResponse({
    status: 302,
    description: 'User is redirected to welcome page',
    headers: {
      Location: {
        description: 'The URL to the welcome page',
        schema: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyAccount(
    @Param('userId', ParseUUIDPipe)
    id: string,
    @Res() res: FastifyReply,
  ) {
    //Get welcome from service
    const welcomeLink = await this.authService.verifyAccount(id, res);

    //Redirect user
    return res.redirect(302, welcomeLink);
  }

  @ApiOperation({ summary: 'Set initial username' })
  @Post('setInitialUsername/:userId')
  @ApiResponse({
    status: 200,
    description: 'User successfully changed username',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: SetUsernameDto })
  async setInitialUsername(
    @Body() body: SetUsernameDto,
    @Param('userId', ParseUUIDPipe) id: string,
  ): Promise<AuthResponseDto> {
    //Get Response from service
    const response = await this.authService.setInitialUsername(id, body);

    return plainToInstance(AuthResponseDto, response);
  }

  @ApiOperation({ summary: 'Refresh the access token using a refresh token' })
  @Get('refreshToken/:userId')
  @ApiResponse({
    status: 200,
    description: 'User access token refresh',
    type: RefreshTokenResponseDto,
  })
  @ApiBearerAuth("refresh-token")
  @UseGuards(RefreshAuthGuard)
  @ApiResponse({ status: 403, description: 'Access Denied' })
  async refreshToken(
    @Param('userId', ParseUUIDPipe) id: string,
  ): Promise<RefreshTokenResponseDto> {
    //Get Response from service
    const token = await this.authService.refreshToken(id);

    return token;
  }

  @ApiOperation({ summary: 'Sign user out' })
  @Post('sign-out/:userId')
  @ApiResponse({
    status: 200,
    description: 'User sign out',
  })
  @ApiResponse({ status: 404, description: 'User Not Found' })
  async signOut(@Param('userId', ParseUUIDPipe) id: string) {
    //Get Response from service
    await this.authService.signOut(id);

    return;
  }
}
