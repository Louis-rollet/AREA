// github.module.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { GithubModule } from './github.module';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

describe('GithubModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [GithubModule],
    }).compile();
  });

  it('devrait être défini', () => {
    expect(module).toBeDefined();
  });

  it('devrait contenir GithubService', () => {
    const githubService = module.get<GithubService>(GithubService);
    expect(githubService).toBeDefined();
  });

  it('devrait contenir GithubController', () => {
    const githubController = module.get<GithubController>(GithubController);
    expect(githubController).toBeDefined();
  });

  it('devrait contenir PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('devrait contenir UserInfos', () => {
    const userInfos = module.get<UserInfos>(UserInfos);
    expect(userInfos).toBeDefined();
  });

  it('devrait contenir AreaService', () => {
    const areaService = module.get<AreaService>(AreaService);
    expect(areaService).toBeDefined();
  });

  it('devrait exporter GithubService', () => {
    const exportedProviders = module.get<GithubService>(GithubService);
    expect(exportedProviders).toBeDefined();
  });
});
