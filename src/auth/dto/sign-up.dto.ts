import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

// Request Body dto for sign-up route
export class SignUpDto {
  @ApiProperty({
    example: 'example123@gmail.com',
    description: 'The email address of the user signing up.',
    format: 'email',
    required: true,
  })
  email: string;
  @ApiProperty({
    example: '123456',
    description:
      'The password for the new account. Should be at least 6 characters long.',
    minLength: 6,
    required: true,
  })
  password: string;
}

// Request body schema for sign-up route
export const signUpSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(15).required(),
});
