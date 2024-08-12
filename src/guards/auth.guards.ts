import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { JwtService } from "../jwt/jwt.service";
import { IS_PUBLIC_KEY } from "./auth-public.decorator";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		// Check if it's a public route
		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		//Extract Cookie from request
		const token = this.extractTokenFromHeader(request);

		if (!token) throw new UnauthorizedException("User Unauthorized");

		try {
			//Verify the cookie jwt
			const payload = await this.jwtService.verifyAccessToken(token);

			request["user"] = payload;
		} catch (err) {
			throw new UnauthorizedException("Invalid Token or Token Expired");
		}

		return true;
	}

	private extractTokenFromHeader(req: FastifyRequest): string | undefined {
		const authHeader = req.headers["authorization"];

		//If no auth header
		if (!authHeader) return null;

		const [authType, token] = authHeader.split(" ");

		return authType === "Bearer" ? token : null;
	}
}
