import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class SetUsernameDto {
  @ApiProperty({
    example: 'Anonymous',
    required: true,
  })
  username: string;
}

export const setUsernameSchema = Joi.object({
  username: Joi.string().required(),
});
