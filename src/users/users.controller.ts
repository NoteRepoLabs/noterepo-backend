import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthResponseDto } from '../auth/dto/auth-response.dto';
import { AuthGuard } from '../guards/auth.guards';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserBioDto, UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

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
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @ApiOperation({summary: 'Fetch user profile'})
  @ApiResponse({ status: 200, description: 'Fetch user profile' })
  @Get(':id/profile')
  async findUserProfile(@Param("id") userId:string){
    return await this.usersService.findUserProfile(userId)
  }

  @ApiOperation({summary: 'Update a user bio'})
  @ApiResponse({
    status: 200,
    description: "User bio updated successfully",
  })
  @UseGuards(AuthGuard)
  @Patch(":id/bio")
  async updateUserBio(@Param('id',ParseUUIDPipe)userId: string,@Body() body: UpdateUserBioDto){
   const user = await this.usersService.updateUserBio(userId,body.bio)

    return plainToInstance(AuthResponseDto,user)
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

  //@ApiOperation({ summary: 'Delete all users. Not to be used on prod db' })
  //@ApiResponse({ status: 204, description: 'All users deleted 💀' })
  //@HttpCode(204)
  //@Delete()
  //async removeAllUsers() {
  //  await this.usersService.removeAllUsers();
  //  return;
  //}
}
