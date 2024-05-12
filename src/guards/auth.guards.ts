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
  constructor(private readonly jwt: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    //Extract Cookie from request
    const token = this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException('User Unauthorized');
    }
    try {
      //Verify the cookie jwt
      const payload = await this.jwt.verify(token);

      request['user'] = payload;
    } catch (err) {
      throw new UnauthorizedException('Token Expired');
    }

    return true;
  }

  private extractTokenFromCookie(req: FastifyRequest): string | undefined {
    const token = req.cookies.authtoken;
    //console.log(`Cookie token ${token}`);
    return token;
  }
}
