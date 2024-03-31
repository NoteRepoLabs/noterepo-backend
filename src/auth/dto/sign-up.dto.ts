import * as Joi from 'joi';

export class SignUpDto {
    email: string
    password: string
}

export const signUpSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(15).required(),
});
