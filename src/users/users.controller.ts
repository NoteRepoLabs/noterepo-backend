import {
  Controller,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async getAllUsers(): Promise<AuthResponseDto[]> {
    const users = await this.usersService.getAllUsers();

    return plainToInstance(AuthResponseDto, users);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @ApiResponse({ status: 204, description: 'Deletes a user 🫠' })
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return;
  }

  @ApiResponse({ status: 204, description: 'All users deleted 💀' })
  @HttpCode(204)
  @Delete()
  async removeAllUsers() {
    await this.usersService.removeAllUsers();
    return;
  }
}
