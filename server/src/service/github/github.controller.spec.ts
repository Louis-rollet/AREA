// github.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

describe('GithubController', () => {
  let controller: GithubController;
  let githubService: GithubService;
  let prismaService: PrismaService;
  let areaService: AreaService;

  const mockGithubService = {
    parseGithubPush: jest.fn(),
    parseGithubStar: jest.fn(),
  };

  const mockPrismaService = {
    area: { findMany: jest.fn() },
    area_reaction: { findMany: jest.fn() },
  };

  const mockUserInfos = {};

  const mockAreaService = {
    launchReactionFunctionForArea: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GithubController],
      providers: [
        { provide: GithubService, useValue: mockGithubService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserInfos, useValue: mockUserInfos },
        { provide: AreaService, useValue: mockAreaService },
      ],
    }).compile();

    controller = module.get<GithubController>(GithubController);
    githubService = module.get<GithubService>(GithubService);
    prismaService = module.get<PrismaService>(PrismaService);
    areaService = module.get<AreaService>(AreaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('githubWebhookPush', () => {
    it('devrait traiter le webhook push et appeler launchReactionFunctionForArea', async () => {
      const mockReq = { body: { ref: 'refs/heads/main' } };
      const mockRes = { send: jest.fn() };

      const mockArea = { id: 1, user_id: 'user123', parameters: '{}', status: true };
      const mockReaction = [{ id: 1 }];
      const mockResult = { success: true };

      mockPrismaService.area.findMany.mockResolvedValue([mockArea]);
      mockGithubService.parseGithubPush.mockReturnValue(mockResult);
      mockPrismaService.area_reaction.findMany.mockResolvedValue(mockReaction);

      await controller.githubWebhookPush(mockReq, mockRes);

      expect(mockPrismaService.area.findMany).toHaveBeenCalledWith({
        where: { action_id: 2, status: true },
      });
      expect(mockGithubService.parseGithubPush).toHaveBeenCalledWith(mockReq.body, mockArea.parameters);
      expect(mockAreaService.launchReactionFunctionForArea).toHaveBeenCalledWith(
        mockReaction,
        mockResult,
        mockArea.user_id,
        mockUserInfos,
      );
      expect(mockRes.send).toHaveBeenCalledWith('ok');
    });
  });

  describe('githubWebhookStar', () => {
    it('devrait traiter le webhook star et appeler launchReactionFunctionForArea', async () => {
      const mockReq = { body: { action: 'starred' } };
      const mockRes = { send: jest.fn() };

      const mockArea = { id: 2, user_id: 'user456', parameters: '{}', status: true };
      const mockReaction = [{ id: 2 }];
      const mockResult = { success: true };

      mockPrismaService.area.findMany.mockResolvedValue([mockArea]);
      mockGithubService.parseGithubStar.mockReturnValue(mockResult);
      mockPrismaService.area_reaction.findMany.mockResolvedValue(mockReaction);

      await controller.githubWebhookStar(mockReq, mockRes);

      expect(mockPrismaService.area.findMany).toHaveBeenCalledWith({
        where: { action_id: 3, status: true },
      });
      expect(mockGithubService.parseGithubStar).toHaveBeenCalledWith(mockReq.body, mockArea.parameters);
      expect(mockAreaService.launchReactionFunctionForArea).toHaveBeenCalledWith(
        mockReaction,
        mockResult,
        mockArea.user_id,
        mockUserInfos,
      );
      expect(mockRes.send).toHaveBeenCalledWith('ok');
    });
  });
});
