import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RepoService } from './repo.service';
import { CreateRepoDto } from './dto/create-repo.dto';
import { plainToInstance } from 'class-transformer';
import { RepoResponseDto } from './dto/repo-response.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guards';

@ApiTags('Repository')
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

  @ApiOperation({ summary: 'Fetch all repositories' })
  @ApiResponse({
    status: 200,
    description: 'Fetches All Repos',
    type: RepoResponseDto,
    isArray: true,
  })
  @Get('repo')
  async getAllRepo(): Promise<RepoResponseDto[]> {
    const response = await this.repoService.getAllRepo();

    return plainToInstance(RepoResponseDto, response);
  }

  @ApiOperation({ summary: 'Fetch repositories of a specific user' })
  @ApiResponse({
    status: 200,
    description: "Fetches a user's repos",
    type: RepoResponseDto,
    isArray: true,
  })
  @Get(':userId/repo')
  async getUserRepo(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<RepoResponseDto[]> {
    const response = await this.repoService.getUserRepo(userId);

    return plainToInstance(RepoResponseDto, response);
  }

}
