import { Role } from "@prisma/client";
import { JoiSchema } from "nestjs-joi";
import * as Joi from "joi";
import { ApiProperty } from "@nestjs/swagger";
import { joiMessages } from "../../utils/joi/joi.messages";

export class UpdateUserDto {
	username?: string;
	email?: string;
	password?: string;
	isVerified?: boolean;
	role?: Role;
	refresh_token?: string;
}

export class UpdateUserBioDto {
	@ApiProperty({
		example: "Always learning",
		minLength: 4,
		maxLength: 225,
		description: "User Bio",
		required: true,
	})
	@JoiSchema(Joi.string().min(4).max(225).required().messages(joiMessages))
	bio: string;
}
