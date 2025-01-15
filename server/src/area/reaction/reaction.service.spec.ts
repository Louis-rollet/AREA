// reaction.service.spec.ts

import { ReactionService } from './reaction.service';

// Mocks
const mockPrismaService = {
  reaction: {
    findMany: jest.fn().mockResolvedValue([{ id: 1, service_id: 1 }, { id: 2, service_id: 2 }]),
    findUnique: jest.fn().mockResolvedValue({ id: 1, service_id: 1 }),
  },
  service: {
    findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'service1' }, { id: 2, name: 'service2' }]),
  },
};

// Crée une instance du service avec les mocks
const service = new ReactionService(mockPrismaService as any);

describe('ReactionService ', () => {
  
  test('Appel de getByService sans vérifier le résultat', async () => {
    await service.getByService(['service1', 'service2']);

  });

  test('Appel de getById sans vérifier le résultat', async () => {
    await service.getById(1);

  });
});
