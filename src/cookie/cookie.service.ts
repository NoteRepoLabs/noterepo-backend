import { Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Injectable()
export class CookieService {
  sendCookie(value: string, res: FastifyReply) {
    const isDevEnv = process.env.NODE_ENV == 'development';

    return res.cookie('authtoken', value, {
      httpOnly: true,
      secure: !isDevEnv,
      sameSite: isDevEnv ? 'lax' : 'none',
      path: '/',
      domain: isDevEnv ? 'localhost' : undefined,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });
  }
}
