import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Version')
@Controller('v1')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiResponse({ status: 200, description: 'Welcome to Note Repo Api V1' })
  @Get()
  getHello(): object {
    return this.appService.getHello();
  }
}
