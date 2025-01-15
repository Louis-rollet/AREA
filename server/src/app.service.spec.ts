// app.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return "localhost" for getHost', () => {
    expect(service.getHost()).toBe('localhost');
  });

  it('should return the current time as a string for getTime', () => {
    const time = service.getTime();
    expect(typeof time).toBe('string');
    expect(Number(time)).not.toBeNaN(); // ensures the string is a valid number
  });
});
