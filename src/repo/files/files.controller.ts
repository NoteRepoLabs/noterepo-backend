import {
  Controller,
  Post,
  Param,
  Req,
  ParseUUIDPipe,
  Delete,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FastifyRequest } from 'fastify';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guards';

@UseGuards(AuthGuard)
@ApiTags('Repository')
@Controller({ path: 'users', version: '1' })
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post(':userId/repo/:repoId/file')
  @ApiOperation({ summary: 'Uploads a single file to a repo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @Req() req: FastifyRequest,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('repoId', ParseUUIDPipe) repoId: string,
  ) {
    return await this.filesService.uploadFile(req, userId, repoId);
  }

  @Delete(':userId/repo/:repoId/file/:fileId')
  @ApiOperation({ summary: 'Deletes a single file from a repo' })
  @HttpCode(204)
  async deleteFile(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('repoId', ParseUUIDPipe) repoId: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
  ) {
    return await this.filesService.deleteFiles(userId, repoId, fileId);
  }
}
