import * as Joi from "joi";

export class GetPublicReposQueryDto {
	next_cursor: string;
	previous_cursor: string;
	limit: number;
}

export const getPublicReposQuerySchema = Joi.object({
	next_cursor: Joi.string().optional(),
	previous_cursor: Joi.string().optional(),
	limit: Joi.number().integer().positive().optional(),
}).oxor("next_cursor", "previous_cursor");

//.xor("next_cursor", "previous_cursor");
