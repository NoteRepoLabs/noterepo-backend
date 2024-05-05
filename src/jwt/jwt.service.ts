import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  async sign(token: object) {
    return jwt.sign(token, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });
  }

  async verify(token: string): Promise<jwt.JwtPayload | string> {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  }
}
