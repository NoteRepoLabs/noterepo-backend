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
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthResponseDto } from '../auth/dto/auth-response.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from 'src/guards/auth.guards';

@ApiTags('Users')
@UseGuards(AuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiResponse({ status: 200, description: 'Fetch all users' })
  @Get()
  async getAllUsers(): Promise<AuthResponseDto[]> {
    const users = await this.usersService.getAllUsers();

    return plainToInstance(AuthResponseDto, users);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  //Forget Password Controller
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

  @ApiResponse({ status: 204, description: 'Deletes a user 🫠' })
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @ApiResponse({ status: 204, description: 'All users deleted 💀' })
  @HttpCode(204)
  @Delete()
  async removeAllUsers() {
    await this.usersService.removeAllUsers();
    return;
  }
}
