import { Controller, Post, Body, Version, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, signUpSchema } from './dto/sign-up.dto';
//import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthValidationPipe } from './pipes/validation.pipie';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @Version('1')
  @UsePipes(new AuthValidationPipe(signUpSchema))
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }
}
