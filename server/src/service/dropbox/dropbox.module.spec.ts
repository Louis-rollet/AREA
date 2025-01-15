// dropbox.module.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DropboxModule } from './dropbox.module';
import { DropboxController } from './dropbox.controller';
import { DropboxService } from './dropbox.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

describe('DropboxModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [DropboxModule],
    }).compile();
  });

  it('devrait être défini', () => {
    expect(module).toBeDefined();
  });

  it('devrait contenir DropboxController', () => {
    const controller = module.get<DropboxController>(DropboxController);
    expect(controller).toBeDefined();
  });

  it('devrait contenir DropboxService', () => {
    const service = module.get<DropboxService>(DropboxService);
    expect(service).toBeDefined();
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
});
