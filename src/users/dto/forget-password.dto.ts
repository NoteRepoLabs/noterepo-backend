import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class ForgetPasswordDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'The email address of the user requesting password reset.',
    format: 'email',
    required: true,
  })
  @JoiSchema(Joi.string().email().required())
  readonly email: string;
}
