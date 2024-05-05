import { Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Injectable()
export class CookieService {
  sendCookie(value: string, res: FastifyReply) {
    const isDevMode = process.env.NODE_ENV === 'development';
    console.log('Dev Mode:', isDevMode);

    return res.cookie('authtoken', value, {
      secure: true,
      httpOnly: false,
      sameSite: 'none',
      domain: isDevMode
        ? 'http://localhost:3456'
        : 'https://www.noterepo.com.ng',
      path: '/',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });
  }
}
