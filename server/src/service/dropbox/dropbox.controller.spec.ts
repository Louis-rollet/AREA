// dropbox.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DropboxController } from './dropbox.controller';
import { DropboxService } from './dropbox.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

describe('DropboxController', () => {
  let controller: DropboxController;
  let dropboxService: DropboxService;
  let prismaService: PrismaService;
  let areaService: AreaService;

  const mockDropboxService = {
    dropboxListFolderContinue: jest.fn(),
    validationForLauchFunctionForArea: jest.fn(),
  };

  const mockPrismaService = {
    area: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    area_reaction: {
      findMany: jest.fn(),
    },
  };

  const mockUserInfos = {};

  const mockAreaService = {
    launchReactionFunctionForArea: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DropboxController],
      providers: [
        { provide: DropboxService, useValue: mockDropboxService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserInfos, useValue: mockUserInfos },
        { provide: AreaService, useValue: mockAreaService },
      ],
    }).compile();

    controller = module.get<DropboxController>(DropboxController);
    dropboxService = module.get<DropboxService>(DropboxService);
    prismaService = module.get<PrismaService>(PrismaService);
    areaService = module.get<AreaService>(AreaService);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  it('devrait retourner la valeur challenge dans dropboxWebhook GET', async () => {
    const mockReq = { query: { challenge: 'test-challenge' } };
    const mockRes = { send: jest.fn() };

    await controller.dropboxWebhook(mockReq, mockRes);

    expect(mockRes.send).toHaveBeenCalledWith('test-challenge');
  });

  it('devrait retourner "ok" si aucune valeur challenge dans dropboxWebhook GET', async () => {
    const mockReq = { query: {} };
    const mockRes = { send: jest.fn() };

    await controller.dropboxWebhook(mockReq, mockRes);

    expect(mockRes.send).toHaveBeenCalledWith('ok');
  });

  it('devrait traiter les événements de dropboxWebhookPost POST', async () => {
    const mockReq = {
      headers: { 'x-dropbox-signature': 'signature123' },
      body: { delta: { users: ['user123'] } },
    };
    const mockRes = { send: jest.fn() };

    const mockArea = { id: 1, status: true, parameters: '{}', last_state_token: 'cursor123', user_id: 'user123' };
    const mockReaction = [{ id: 1 }];
    const mockDropboxResponse = { cursor: 'newCursor123', entries: [{ id: 'entry1' }] };

    mockPrismaService.area.findMany.mockResolvedValue([mockArea]);
    mockDropboxService.dropboxListFolderContinue.mockResolvedValue(mockDropboxResponse);
    mockDropboxService.validationForLauchFunctionForArea.mockReturnValue(true);
    mockPrismaService.area_reaction.findMany.mockResolvedValue(mockReaction);
  });
});
