import * as Joi from 'joi';

export class ResetPasswordDto {
  password: string;
  confirmPassword: string;
}

export const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).max(15).required(),
  confirmPassword: Joi.string().min(6).max(15).required(),
});
