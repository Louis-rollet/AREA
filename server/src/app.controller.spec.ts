// app.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServiceService } from './service/service.service';
import { ActionService } from './area/action/action.service';
import { ReactionService } from './area/reaction/reaction.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let serviceService: ServiceService;
  let actionService: ActionService;
  let reactionService: ReactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: { getTime: jest.fn().mockReturnValue(Date.now()) },
        },
        {
          provide: ServiceService,
          useValue: { getAll: jest.fn().mockResolvedValue([{ name: 'service1' }, { name: 'service2' }]) },
        },
        {
          provide: ActionService,
          useValue: {
            getByService: jest.fn().mockImplementation((serviceNames) => 
              serviceNames.map((name) => ({ name: `${name}Action`, description: `${name} action description` })),
            ),
          },
        },
        {
          provide: ReactionService,
          useValue: {
            getByService: jest.fn().mockImplementation((serviceNames) =>
              serviceNames.map((name) => ({ name: `${name}Reaction`, description: `${name} reaction description` })),
            ),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
    serviceService = module.get<ServiceService>(ServiceService);
    actionService = module.get<ActionService>(ActionService);
    reactionService = module.get<ReactionService>(ReactionService);
  });

  describe('getAbout', () => {
    it('should return the about information with client and server details', async () => {
      const mockReq = { ip: '::ffff:172.24.0.1' };
      
      const about = await appController.getAbout(mockReq);

      expect(about).toHaveProperty('client');
      expect(about).toHaveProperty('server');
      expect(about.client).toEqual({ host: '::ffff:172.24.0.1' });
      expect(about.server).toHaveProperty('current_time');
      expect(typeof about.server.current_time).toBe('number');
      expect(about.server).toHaveProperty('services');
      expect(Array.isArray(about.server.services)).toBeTruthy();
      
      const googleService = about.server.services.find(service => service.name === 'Google');
      expect(googleService).toBeUndefined();
      // expect(googleService.actions[0]).toEqual({
      //   name: 'Récupérer nouveau Email',
      //   description: 'catch latest email ',
      // });
      // expect(googleService.reactions[0]).toEqual({
      //   name: 'Envoyer un mail',
      //   description: 'send email',
      // });
      // expect(googleService.reactions[1]).toEqual({
      //   name: 'Crée tache google tasks',
      //   description: 'googe tasks',
      // });
      // expect(googleService.reactions[2]).toEqual({
      //   name: 'Ajouter evenement google calendar',
      //   description: 'google calendar event',
      // });

      const githubService = about.server.services.find(service => service.name === 'Github');
      expect(githubService).toBeUndefined();
      // expect(githubService.actions[0]).toEqual({
      //   name: 'Event push github repository',
      //   description: 'check change on repo',
      // });
      // expect(githubService.actions[1]).toEqual({
      //   name: 'Event star github repository',
      //   description: 'check change on repo',
      // });
      // expect(githubService.reactions[0]).toEqual({
      //   name: 'Créer un github issue',
      //   description: 'create an issue on a repository',
      // });
    });
  });
});
