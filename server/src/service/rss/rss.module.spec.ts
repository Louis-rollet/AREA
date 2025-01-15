// rss.module.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { RssModule } from './rss.module';
import { RssController } from './rss.controller';
import { RssService } from './rss.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

describe('RssModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [RssModule],
    }).compile();
  });

  it('devrait être défini', () => {
    const rssModule = module.get<RssModule>(RssModule);
    expect(rssModule).toBeDefined();
  });

  it('devrait fournir le RssController', () => {
    const controller = module.get<RssController>(RssController);
    expect(controller).toBeDefined();
  });

  it('devrait fournir le RssService', () => {
    const service = module.get<RssService>(RssService);
    expect(service).toBeDefined();
  });

  it('devrait fournir le PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('devrait fournir le UserInfos', () => {
    const userInfos = module.get<UserInfos>(UserInfos);
    expect(userInfos).toBeDefined();
  });

  it('devrait fournir le AreaService', () => {
    const areaService = module.get<AreaService>(AreaService);
    expect(areaService).toBeDefined();
  });
});
