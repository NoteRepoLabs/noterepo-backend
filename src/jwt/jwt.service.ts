import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  async signAccessToken(token: object) {
    return jwt.sign(token, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME,
    });
  }

  async signRefreshToken(token: object) {
    return jwt.sign(token, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
    });
  }

  async verifyAccessToken(token: string): Promise<jwt.JwtPayload | string> {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return payload;
  }

  async verifyRefreshToken(token: string): Promise<jwt.JwtPayload | string> {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return payload;
  }
}
