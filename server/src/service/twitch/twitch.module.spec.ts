// twitch.module.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TwitchModule } from './twitch.module';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

describe('TwitchModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TwitchModule],
    }).compile();
  });

  it('devrait être défini', () => {
    expect(module).toBeDefined();
  });

  it('devrait fournir TwitchService', () => {
    const twitchService = module.get<TwitchService>(TwitchService);
    expect(twitchService).toBeDefined();
  });

  it('devrait fournir PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('devrait fournir UserInfos', () => {
    const userInfos = module.get<UserInfos>(UserInfos);
    expect(userInfos).toBeDefined();
  });

  it('devrait fournir AreaService', () => {
    const areaService = module.get<AreaService>(AreaService);
    expect(areaService).toBeDefined();
  });

  it('devrait avoir TwitchController dans les contrôleurs', () => {
    const twitchController = module.get<TwitchController>(TwitchController);
    expect(twitchController).toBeDefined();
  });
});
