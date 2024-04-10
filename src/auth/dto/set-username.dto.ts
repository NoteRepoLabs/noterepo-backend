import { ApiProperty } from '@nestjs/swagger';
import { joiMessages } from '../../utils/joi/joi.messages';
import { JoiSchema } from 'nestjs-joi';
import * as Joi from 'joi';

export class SetUsernameDto {
  @ApiProperty({
    example: 'Anonymous',
    required: true,
  })
  @JoiSchema(Joi.string().min(5).max(15).required().messages(joiMessages))
  username: string;
}
