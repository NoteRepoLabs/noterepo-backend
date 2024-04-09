import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

// Request body dto for sign-in route
export class SignInDto {
  @ApiProperty({
    example: 'example123@gmail.com',
    required: true,
  })
  email: string;
  @ApiProperty({
    example: '123456',
    required: true,
  })
  password: string;
}

// Request body schema for sign-in route
export const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(15).required(),
});
