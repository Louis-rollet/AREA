import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHost(): string {
    return 'localhost';
  }
  getTime(): string {
    return new Date().getTime().toString();
  }
}
