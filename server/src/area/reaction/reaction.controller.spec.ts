// reaction.controller.spec.ts

import { ReactionController } from './reaction.controller';

// Mocks
const mockUserInfos = {
  fetchUserService: jest.fn().mockResolvedValue(['service1', 'service2']),
  getAllServices: jest.fn().mockResolvedValue(['service1', 'service2']),
};
const mockReactionService = {
  getByService: jest.fn().mockResolvedValue(['reaction1', 'reaction2']),
  getById: jest.fn().mockReturnValue('reaction'),
  getAllServices: jest.fn().mockResolvedValue(['service1', 'service2']),
};

// Crée une instance du contrôleur avec les mocks
const controller = new ReactionController(mockUserInfos as any, mockReactionService as any);

describe('ReactionController ', () => {

  test('Appel de getByUser sans vérifier le résultat', async () => {
    const req = { auth: { sub: 'user123' } };
    const res = { send: jest.fn() };

    await controller.getByUser(req, res);

  });

  test('Appel de getById avec un id valide sans vérifier le résultat', () => {
    controller.getById('1');

  });

  test('Appel de getById avec un id invalide sans vérifier le résultat', () => {
    controller.getById('invalid');

  });
});
