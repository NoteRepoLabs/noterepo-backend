import { Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Injectable()
export class CookieService {
  sendCookie(value: string, res: FastifyReply) {
    return res.cookie('noterepo.auth.token', value, {
      httpOnly: true,
      sameSite: true,
      domain: 'https://www.noterepo.com.ng',
      secure: process.env.NODE_ENV === 'development' ? false : true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), //1 day
    });
  }
  //For development purposes only
  sendDevCookie(value: string, res: FastifyReply) {
    return res.cookie('noterepo.auth.token', value, {
      httpOnly: true,
      sameSite: 'none',
      domain: 'http://localhost',
      secure: false,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), //1 day
    });
  }
}
