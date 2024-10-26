import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RepoService } from './repo.service';
import { CreateRepoDto } from './dto/create-repo.dto';
import { plainToInstance } from 'class-transformer';
import { RepoResponseDto, ReposResponseDto } from './dto/repo-response.dto';
import { ApiQuery, ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guards';
import {
  bookmarkRepoIdsResponseDto,
  bookmarkResponseDto,
} from './dto/bookmark-response.dto';
import { Throttle, seconds } from '@nestjs/throttler';
import {Public} from '../guards/auth-public.decorator'
import { QueryValidationPipe } from '../utils/pipes/queryValidation.pipe';
import { GetPublicReposQueryDto, getPublicReposQuerySchema } from './dto/get-repo-query.dto';

@ApiTags('Repository')
@ApiBearerAuth("access-token")
@UseGuards(AuthGuard)
@Controller({ path: 'users', version: '1' })
export class RepoController {
  constructor(private readonly repoService: RepoService) { }
  @ApiOperation({ summary: 'Create a new repository for a user' })
  @ApiResponse({
    status: 201,
    description: 'Returns created repo',
    type: RepoResponseDto,
  })
  @ApiBody({
    type: CreateRepoDto,
    description: 'Json structure for repo object',
  })
  @Post(':userId/repo')
  async CreateRepo(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: CreateRepoDto,
  ): Promise<RepoResponseDto> {
    const response = await this.repoService.createRepo(userId, body);

    return plainToInstance(RepoResponseDto, response);
  }

  @ApiOperation({ summary: 'Fetch all public repositories' })
  @ApiResponse({
    status: 200,
    description: 'Fetches all public repositories based on provided query parameters',
  })
  @ApiQuery({
    name: 'next_cursor',
    required: false,
    description: 'Cursor for fetching the next set of results (base64 encoded)',
    type: String,
  })
  @ApiQuery({
    name: 'previous_cursor',
    required: false,
    description: 'Cursor for fetching the previous set of results (base64 encoded)',
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of repositories to return per page (default is 10, maximum is 15)',
    type: Number,
    example: 10,
  })
  @Get('repo')
  async getAllRepo(
    @Query(new QueryValidationPipe(getPublicReposQuerySchema)) query: GetPublicReposQueryDto,
  ) {
    const response = await this.repoService.getAllPublicRepos(query.next_cursor, query.previous_cursor, query.limit);

    return response;
  }

  @ApiOperation({ summary: 'Fetch repositories of a specific user' })
  @ApiResponse({
    status: 200,
    description: "Fetches a user's repos",
    type: ReposResponseDto,
    isArray: true,
  })
  @Get(':userId/repo')
  async getAllUserRepos(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<ReposResponseDto[]> {
    const response = await this.repoService.getAllUserRepos(userId);

    return plainToInstance(ReposResponseDto, response);
  }

  @ApiOperation({ summary: 'Fetch a specific repository of a user' })
  @ApiResponse({
    status: 200,
    description: "Fetches a specific repo of the user",
    type: RepoResponseDto,
  })
  @Get(':userId/repo/:repoId')
  async getUserRepo(
    @Param('userId', ParseUUIDPipe) userId: string,@Param('repoId',ParseUUIDPipe) repoId: string
  ): Promise<RepoResponseDto> {
    const response = await this.repoService.getUserRepo(userId,repoId);

    return plainToInstance(RepoResponseDto, response);
  }

  @ApiOperation({ summary: 'Fetch a specific repository for sharing' })
  @ApiResponse({
    status: 200,
    description: "Fetches a specific repo for sharing",
    type: RepoResponseDto,
  })
  @Public()// Public route
  @Get('repo/:repoId/share')
  async getRepoForSharing(
    @Param('repoId',ParseUUIDPipe) repoId: string
  ): Promise<RepoResponseDto> {
    const response = await this.repoService.findRepoById(repoId,true);

    //Check if the repo is public before sharing
    if(!response.isPublic){
      throw new ForbiddenException("Unauthorized access, repo not public")
    }

    return plainToInstance(RepoResponseDto, response);
  }



  @Throttle({ throttlers: { limit: 7, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Bookmark a repository of a user' })
  @ApiResponse({
    status: 201,
    description: "Fetches a user's bookmark record",
  })
  @Post(':userId/repo/:repoId/bookmark')
  async bookmarkRepo(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('repoId', ParseUUIDPipe) repoId: string,
  ): Promise<bookmarkResponseDto> {
    const response = await this.repoService.bookmarkRepo(userId, repoId);

    return plainToInstance(bookmarkResponseDto, response);
  }

  @Throttle({ throttlers: { limit: 7, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Unbookmark a repository of a user' })
  @ApiResponse({
    status: 204,
    description: 'Deletes the bookmark record',
    type: RepoResponseDto,
  })
  @HttpCode(204)
  @Delete(':userId/repo/:repoId/bookmark')
  async unbookmarkRepo(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('repoId', ParseUUIDPipe) repoId: string,
  ): Promise<RepoResponseDto> {
    await this.repoService.unbookmarkRepo(userId, repoId);

    return;
  }

  @ApiOperation({ summary: 'Fetch all bookmarks of a specific user' })
  @ApiResponse({
    status: 200,
    description: "Fetches a user's bookmarks",
    type: RepoResponseDto,
    isArray: true,
  })
  @Get(':userId/bookmarks')
  async getBookmarks(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<RepoResponseDto[]> {
    const response = await this.repoService.getBookmarks(userId);

    return plainToInstance(RepoResponseDto, response);
  }

  @ApiOperation({ summary: 'Fetch all bookmarked repo ids of a specific user' })
  @ApiResponse({
    status: 200,
    description: "Fetches a user's bookmarked repos ids",
    type: RepoResponseDto,
    isArray: true,
  })
  @Get(':userId/bookmarks/repoIds')
  async getBookmarksRepoIds(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<bookmarkRepoIdsResponseDto> {
    const response = await this.repoService.getBookmarksRepoIds(userId);

    return plainToInstance(bookmarkRepoIdsResponseDto, response);
  }

  @ApiOperation({ summary: 'Delete a repository of a user' })
  @ApiResponse({
    status: 204,
    description: "Deletes a user's repo",
  })
  @HttpCode(204)
  @Delete(':userId/repo/:repoId')
  async deleteUserRepo(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('repoId', ParseUUIDPipe) repoId: string,
  ) {
    return await this.repoService.deleteUserRepo(userId, repoId);
  }
}
