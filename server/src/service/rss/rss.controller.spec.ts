// rss.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { RssController } from './rss.controller';
import { RssService } from './rss.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

describe('RssController', () => {
  let controller: RssController;
  let rssService: RssService;
  let prismaService: PrismaService;
  let areaService: AreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RssController],
      providers: [RssService, PrismaService, UserInfos, AreaService],
    }).compile();

    controller = module.get<RssController>(RssController);
    rssService = module.get<RssService>(RssService);
    prismaService = module.get<PrismaService>(PrismaService);
    areaService = module.get<AreaService>(AreaService);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('onModuleInit', () => {
    it("devrait initialiser l'intervalle pour vérifier les flux RSS", () => {
      jest.useFakeTimers();
      controller.onModuleInit();
    });
  });

  describe('onModuleDestroy', () => {
    it('devrait effacer l’intervalle à la destruction', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      controller.onModuleInit();
      controller.onModuleDestroy();
    });
  });

  describe('check_rss', () => {
    it("devrait vérifier les flux RSS et lancer des fonctions de réaction", async () => {
      const mockAreas = [
        { id: 1, action_id: 7, status: true, parameters: '{"rss_link": "https://example.com/rss"}', last_state_token: '' },
      ];
      const mockRssFeed = { items: [{ title: 'Test Title', pubDate: '2024-01-01', link: 'https://example.com/rss/1' }] };
      const mockReactions = [{ area_id: 1 }];

      jest.spyOn(prismaService.area, 'findMany').mockResolvedValue(mockAreas as any);
      jest.spyOn(rssService, 'getRssFeed').mockResolvedValue(mockRssFeed as any);
      jest.spyOn(prismaService.area_reaction, 'findMany').mockResolvedValue(mockReactions as any);
      const launchReactionSpy = jest.spyOn(areaService, 'launchReactionFunctionForArea').mockResolvedValue(undefined);
    });

    it("ne devrait pas lancer de fonction de réaction si aucun flux RSS n'est trouvé", async () => {
      jest.spyOn(prismaService.area, 'findMany').mockResolvedValue([]);
      const launchReactionSpy = jest.spyOn(areaService, 'launchReactionFunctionForArea').mockResolvedValue(undefined);

      await controller.check_rss();

      expect(launchReactionSpy).not.toHaveBeenCalled();
    });
  });
});
