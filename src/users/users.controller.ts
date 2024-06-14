import {
  Controller,
  Body,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  HttpCode,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthResponseDto } from '../auth/dto/auth-response.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '../guards/auth.guards';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Fetch all users' })
  @ApiResponse({ status: 200, description: 'Fetch all users' })
  @UseGuards(AuthGuard)
  @Get()
  async getAllUsers(): Promise<AuthResponseDto[]> {
    const users = await this.usersService.getAllUsers();

    return plainToInstance(AuthResponseDto, users);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  //Forget Password Controller
  @ApiOperation({ summary: 'Send password reset email' })
  @Post('forget-password')
  @ApiResponse({
    status: 200,
    description: 'Password reset mail sent',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgetPassword(@Body() body: ForgetPasswordDto) {
    const response = await this.usersService.forgetPassword(body);

    return { message: response };
  }

  //Reset Password Controller
  @ApiOperation({ summary: 'Reset user password' })
  @Post('reset-password/:userId')
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(
    @Param('userId', ParseUUIDPipe) id: string,
    @Body() body: ResetPasswordDto,
  ) {
    const response = await this.usersService.resetPassword(id, body);

    return response;
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 204, description: 'Deletes a user 🫠' })
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @ApiOperation({ summary: 'Delete all users. Not to be used on prod db' })
  @ApiResponse({ status: 204, description: 'All users deleted 💀' })
  @HttpCode(204)
  @Delete()
  async removeAllUsers() {
    await this.usersService.removeAllUsers();
    return;
  }
}
