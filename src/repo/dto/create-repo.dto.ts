import { JoiSchema } from "nestjs-joi";
import * as Joi from "joi";
import { joiMessages } from "../../utils/joi/joi.messages";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRepoDto {
	@ApiProperty({
		example: "My repo",
		minLength: 4,
		maxLength: 30,
		description: "Name of repo",
		required: true,
	})
	@JoiSchema(Joi.string().min(4).max(30).required().messages(joiMessages))
	name: string;

	@ApiProperty({
		example: "Repo containing my science note",
		minLength: 4,
		maxLength: 50,
		description: "Description of repo",
		required: true,
	})
	@JoiSchema(Joi.string().min(4).max(50).required().messages(joiMessages))
	description: string;

	@ApiProperty({
		example: ["phs121", "physics"],
		minLength: 1,
		description: "Tags of the repo",
		required: true,
	})
	@JoiSchema(Joi.array().min(1).messages(joiMessages).required())
	tags: string[];

	@ApiProperty({
		example: false,
		enum: [true, false],
		description: "Repo visibility",
		required: true,
	})
	@JoiSchema(Joi.boolean().messages(joiMessages))
	isPublic: boolean;
}
