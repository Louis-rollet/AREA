// twitch.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

describe('TwitchController', () => {
  let controller: TwitchController;
  let twitchService: TwitchService;
  let prismaService: PrismaService;
  let userInfos: UserInfos;
  let areaService: AreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwitchController],
      providers: [TwitchService, PrismaService, UserInfos, AreaService],
    }).compile();

    controller = module.get<TwitchController>(TwitchController);
    twitchService = module.get<TwitchService>(TwitchService);
    prismaService = module.get<PrismaService>(PrismaService);
    userInfos = module.get<UserInfos>(UserInfos);
    areaService = module.get<AreaService>(AreaService);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('twitchWebhook', () => {
    it("devrait répondre avec le challenge si l'en-tête est de vérification", async () => {
      const req = {
        body: { challenge: 'test_challenge' },
        headers: { 'twitch-eventsub-message-type': 'webhook_callback_verification' },
      };
      const res = {
        set: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await controller.twitchWebhook(req, res);
      expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/plain');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('test_challenge');
    });

    it('devrait répondre avec "ok" si aucun area ne correspond', async () => {
      const req = {
        body: {
          subscription: { id: 'test_subscription' },
          event: { type: 'stream.online', started_at: '2023-09-12T12:34:56Z', broadcaster_user_name: 'test_broadcaster' },
        },
        headers: { 'twitch-eventsub-message-type': 'notification' },
      };
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      prismaService.area.findMany = jest.fn().mockResolvedValue([]);
      await controller.twitchWebhook(req, res);
    });

    it('devrait lancer la réaction si les conditions sont remplies', async () => {
      const req = {
        body: {
          subscription: { id: 'test_subscription' },
          event: { type: 'stream.online', started_at: '2023-09-12T12:34:56Z', broadcaster_user_name: 'test_broadcaster' },
        },
        headers: { 'twitch-eventsub-message-type': 'notification' },
      };
      const res = { send: jest.fn() };

      prismaService.area.findMany = jest.fn().mockResolvedValue([{ id: 1, status: true, last_state_token: 'test_subscription', user_id: 'user_123' }]);
      prismaService.area_reaction.findMany = jest.fn().mockResolvedValue([{ area_id: 1 }]);
      areaService.launchReactionFunctionForArea = jest.fn();

      await controller.twitchWebhook(req, res);

      expect(areaService.launchReactionFunctionForArea).toHaveBeenCalledWith(
        [{ area_id: 1 }],
        {
          action: 'stream.online',
          date: '2023-09-12T12:34:56Z',
          broadcaster: 'test_broadcaster',
        },
        'user_123',
        userInfos,
      );
      expect(res.send).toHaveBeenCalledWith('ok');
    });
  });
});
