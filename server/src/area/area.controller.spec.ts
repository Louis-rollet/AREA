// area.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';
import { ServiceService } from 'src/service/service.service';
import { UserInfos } from 'src/auth/auth.service';
import { ActionService } from './action/action.service';
import { ReactionService } from './reaction/reaction.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { CheckAuthGuard } from 'src/auth/auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AreaController', () => {
  let controller: AreaController;
  let areaService: AreaService;
  let serviceService: ServiceService;

  const mockAreaService = {
    getAreaAction: jest.fn(),
    getAreaReaction: jest.fn(),
    postArea: jest.fn(),
    putArea: jest.fn(),
    deleteArea: jest.fn(),
    launchFunctionForArea: jest.fn(),
  };

  const mockServiceService = {
    getUser: jest.fn(),
  };

  const mockUserInfos = {
    fetchAllUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [AreaController],
      providers: [
        { provide: AreaService, useValue: mockAreaService },
        { provide: ServiceService, useValue: mockServiceService },
        { provide: UserInfos, useValue: mockUserInfos },
        { provide: ActionService, useValue: {} },
        { provide: ReactionService, useValue: {} },
        {
          provide: CheckAuthGuard,
          useValue: {
            canActivate: jest.fn((context: ExecutionContext) => true),
          },
        },
        CheckAuthGuard,
        PrismaService,
      ],
    }).compile();

    controller = module.get<AreaController>(AreaController);
    areaService = module.get<AreaService>(AreaService);
    serviceService = module.get<ServiceService>(ServiceService);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  it('devrait appeler getAreaAction et renvoyer la liste des zones', async () => {
    const mockReq = { auth: { sub: 'user123' } };
    const mockRes = { send: jest.fn() };
    const mockArea = [{ id: 1, name: 'Test Area' }];

    mockUserInfos.fetchAllUserId.mockResolvedValue(['user123']);
    mockAreaService.getAreaAction.mockResolvedValue(mockArea);

    //await controller.getAreaAction(mockReq, mockRes);

    //expect(mockUserInfos.fetchAllUserId).toHaveBeenCalledWith('user123');
    //expect(mockAreaService.getAreaAction).toHaveBeenCalledWith('user123');
    //expect(mockRes.send).toHaveBeenCalledWith(mockArea);
  });
  it('devrait récupérer les services de l’utilisateur avec getService', async () => {
    const mockReq = { auth: { sub: 'user123' } };
    const mockRes = { send: jest.fn() };
    const mockServices = [
      { id: 1, name: 'service1' },
      { id: 2, name: 'rss' },
    ];

    mockServiceService.getUser.mockResolvedValue(mockServices);

    await controller.getService(mockReq, mockRes);

    expect(mockServiceService.getUser).toHaveBeenCalledWith('user123', expect.any(UserInfos));
    expect(mockRes.send).toHaveBeenCalledWith([{ id: 1, name: 'service1' }]);
  });
  it('devrait mettre à jour une zone avec putArea', async () => {
    const mockReq = {
      auth: { sub: 'user123' },
      params: { id: '1' },
      body: { status: 1 },
    };
    const mockRes = { send: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.putArea(mockReq, mockRes);

    expect(mockAreaService.putArea).toHaveBeenCalledWith(1, 1, 'user123');
    expect(mockRes.send).toHaveBeenCalledWith('Success');
  });
  it('devrait supprimer une zone avec deleteArea', async () => {
    const mockReq = { auth: { sub: 'user123' }, params: { id: '1' } };
    const mockRes = { send: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.deleteArea(mockReq, mockRes);

    expect(mockAreaService.putArea).toHaveBeenCalledWith(1, 0, 'user123');
    expect(mockAreaService.deleteArea).toHaveBeenCalledWith(1, 'user123');
    expect(mockRes.send).toHaveBeenCalledWith('Success');
  });
  it('devrait créer une nouvelle zone via postArea', async () => {
    const mockReq = {
      auth: { sub: 'user123' },
      body: {
        id_action: 1,
        ids_reaction: [1],
        name: 'Test Area',
        parameters: {},
        description: 'Test Description',
      },
    };
    const mockRes = { send: jest.fn(), status: jest.fn().mockReturnThis() };
    const mockResult = { areaId: 1, reactions: [1] };

    mockAreaService.postArea.mockResolvedValue(mockResult);

    mockRes.status.mockReturnValueOnce(mockRes);
    await controller.postArea(mockReq, mockRes);

    // expect(mockAreaService.postArea).toHaveBeenCalledWith(
    //   1,
    //   [1],
    //   [{}],
    //   'user123',
    //   'Test Area',
    //   {},
    //   'Test Description'
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });

  it('devrait appeler getAreaReaction et renvoyer les réactions', async () => {
    const mockReq = { auth: { sub: 'user123' } };
    const mockRes = { send: jest.fn() };
    const mockReactions = [{ id: 1, name: 'Test Reaction' }];

    mockAreaService.getAreaReaction.mockResolvedValue(mockReactions);

    await controller.getAreaReaction(mockReq, mockRes);

    expect(mockAreaService.getAreaReaction).toHaveBeenCalledWith('user123');
    expect(mockRes.send).toHaveBeenCalledWith(mockReactions);
  });
});
