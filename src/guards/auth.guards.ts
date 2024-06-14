import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    //Extract Cookie from request
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('User Unauthorized');

    try {
      //Verify the cookie jwt
      const payload = await this.jwtService.verifyAccessToken(token);

      request['user'] = payload;
    } catch (err) {
      throw new UnauthorizedException('Invalid Token or Token Expired');
    }

    return true;
  }

  private extractTokenFromHeader(req: FastifyRequest): string | undefined {
    const authHeader = req.headers['authorization'];

    //If no auth header
    if (!authHeader) return null;

    const [authType, token] = authHeader.split(' ');

    return authType === 'Bearer' ? token : null;
  }
}
