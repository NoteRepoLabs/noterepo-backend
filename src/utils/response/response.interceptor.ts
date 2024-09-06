import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		return next
			.handle()
			.pipe(map((res: unknown) => this.responseHandler(res, context)));
	}

	//Response interceptor, still experimenting with this
	responseHandler(res: any, context: ExecutionContext) {
		const ctx = context.switchToHttp();
		const response = ctx.getResponse();
		//const request = ctx.getRequest();
		const message =
			response.statusCode < 400
				? res?.message || "Request successful"
				: res?.message || "Request failed";

		return {
			status: "success",
			statusCode: response.statusCode,
			message,
			payload: res,
		};
	}
}
