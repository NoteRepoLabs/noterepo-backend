import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { RepoService } from './repo.service';
import { CreateRepoDto } from './dto/create-repo.dto';
import { plainToInstance } from 'class-transformer';
import { RepoResponseDto } from './dto/repo-response.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class RepoController {
  constructor(private readonly repoService: RepoService) { }

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

  @ApiResponse({
    status: 200,
    description: 'Fetches All Repos',
    type: RepoResponseDto,
  })
  @Get('repo')
  async getAllRepo(): Promise<RepoResponseDto[]> {
    const response = await this.repoService.getAllRepo();

    return plainToInstance(RepoResponseDto, response);
  }

  @ApiResponse({
    status: 200,
    description: 'Fetches a users repos',
    type: RepoResponseDto,
  })
  @Get(':userId/repo')
  async getUserRepo(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<RepoResponseDto[]> {
    const response = await this.repoService.getUserRepo(userId);

    return plainToInstance(RepoResponseDto, response);
  }
}
