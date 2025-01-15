// action.controller.spec.ts

import { ActionController } from './action.controller';

// Mocks
const mockUserInfos = {
  fetchUserService: jest.fn().mockResolvedValue(['service1', 'service2']),
};
const mockActionService = {
  getByService: jest.fn().mockResolvedValue(['action1', 'action2']),
  getById: jest.fn().mockReturnValue('action'),
  getAllServices: jest.fn().mockResolvedValue(['service1', 'service2', 'service3']),
};

// Crée une instance du contrôleur avec les mocks
const controller = new ActionController(mockUserInfos as any, mockActionService as any);

describe('ActionController ', () => {
  
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
