import {
  Controller,
  Post,
  Get,
  Body,
  UsePipes,
  Res,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, signUpSchema } from './dto/sign-up.dto';
import { AuthValidationPipe } from '../utils/pipes/validation.pipe';
import { SignInDto, signInSchema } from './dto/sign-in.dto';
import { FastifyReply } from 'fastify';
import { AuthResponseDto } from './dto/auth-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SetUsernameDto } from './dto/set-username.dto';
import { SearchService } from '../search/search.service';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' }) // Auth version 1 controller
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly searchService: SearchService,
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
    const user = await this.authService.signIn(body, res);

    const searchToken = await this.searchService.createTenantSearchToken(
      user.id,
    );

    //Generate response with search token
    const response = { ...user, searchToken };

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
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<AuthResponseDto> {
    //Get Response from service
    const user = await this.authService.setInitialUsername(id, body, res);

    const searchToken = await this.searchService.createTenantSearchToken(
      user.id,
    );

    //Generate user response with search token
    const response = { ...user, searchToken };

    return plainToInstance(AuthResponseDto, response);
  }
}
