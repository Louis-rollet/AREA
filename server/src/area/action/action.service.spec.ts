// action.service.spec.ts

import { ActionService } from './action.service';

// Mocks
const mockPrismaService = {
  action: {
    findMany: jest.fn().mockResolvedValue([{ id: 1, service_id: 1 }, { id: 2, service_id: 2 }]),
    findUnique: jest.fn().mockResolvedValue({ id: 1, service_id: 1 }),
  },
  service: {
    findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'service1' }, { id: 2, name: 'service2' }]),
  },
};

// Crée une instance du service avec les mocks
const service = new ActionService(mockPrismaService as any);

describe('ActionService ', () => {
  
  test('Appel de getByService sans vérifier le résultat', async () => {
    await service.getByService(['service1', 'service2']);

  });

  test('Appel de getById sans vérifier le résultat', async () => {
    await service.getById(1);

  });
});
