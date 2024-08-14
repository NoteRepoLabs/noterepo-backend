import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import * as Sentry from "@sentry/nestjs";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		// Capture the exception with Sentry
		Sentry.captureException(exception);

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		response.status(status).send({
			status: "fail",
			path: request.url,
			message:
				status < 500
					? exception.message.replace(/"/g, "")
					: "An Error Occurred",
			error_trace:
				process.env.NODE_ENV === "development" ? exception.stack : undefined,
		});
	}
}
