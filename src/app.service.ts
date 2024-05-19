import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return { message: 'Welcome to Note Repo Api V1' };
  }

  checkHealth() {
    return;
  }

  checkSession() {
    return "You're currently authenticated";
  }
}
