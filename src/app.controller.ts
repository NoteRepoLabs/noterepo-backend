import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guards';

@ApiTags('Version')
@Controller('v1')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiResponse({ status: 200, description: 'Welcome to Note Repo Api V1' })
  @Get()
  getHello(): object {
    return this.appService.getHello();
  }

  @ApiResponse({ status: 200, description: "returns server's health status" })
  @Get('/health')
  checkHealth() {
    return this.appService.checkHealth();
  }

  @ApiResponse({
    status: 200,
    description: "Returns user's authentication status",
  })
  @UseGuards(AuthGuard)
  @Get('/check-session')
  checkSession(): string {
    return this.appService.checkSession();
  }
}
