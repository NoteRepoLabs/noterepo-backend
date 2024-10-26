import {
	ArgumentMetadata,
	BadRequestException,
	Injectable,
	PipeTransform,
} from "@nestjs/common";
import * as Joi from "joi";

@Injectable()
export class QueryValidationPipe implements PipeTransform {
	constructor(private readonly schema: Joi.ObjectSchema) {}

	async transform(value: any, metadata: ArgumentMetadata) {
		if (metadata.type !== "query") {
			return value;
		}

		try {
			//Validate against Joi schema
			await this.schema.validateAsync(value);

			return value;
		} catch (error) {
			if (error instanceof Joi.ValidationError) {
				throw new BadRequestException(error.message.replace(/"/g, ""));
			}
			throw error;
		}
	}
}
