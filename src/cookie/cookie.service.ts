import { Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Injectable()
export class CookieService {
  sendCookie(value: string, res: FastifyReply) {
    return res.setCookie('authtoken', value, {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      domain: '.noterepo.com.ng',
      path: '/',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });
  }
}
