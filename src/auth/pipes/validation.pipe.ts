import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class AuthValidationPipe implements PipeTransform {
  constructor(private readonly schema: Joi.ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('Request body is empty');
    }

    //Validate against Joi schema
    const { error } = this.schema.validate(value);

    if (error) {
      throw new BadRequestException(
        'Invalid Body',
        error.message.replace(/"/g, ''),
      );
    }

    return value;
  }
}
