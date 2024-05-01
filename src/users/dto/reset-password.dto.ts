import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { joiMessages } from '../../utils/joi/joi.messages';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'anony1234',
    description: 'The new password for the user account',
    minLength: 6,
    maxLength: 15,
    required: true,
  })
  @JoiSchema(Joi.string().min(6).max(15).required().messages(joiMessages))
  password: string;

  @ApiProperty({
    example: 'anony1234',
    description: 'Confirmation of the new password.',
    required: true,
  })
  @JoiSchema(Joi.string().min(6).max(15).required().messages(joiMessages))
  confirmPassword: string;
}
