// area.service.spec.ts

import { AreaService } from './area.service';

// Mocks
const mockPrismaService = {
  area: {
    findUnique: jest.fn().mockResolvedValue({ id: 1, action_id: 1, user_id: 'user123' }),
    findFirst: jest.fn().mockResolvedValue({ id: 1, action_id: 1, user_id: 'user123' }),
    findMany: jest.fn().mockResolvedValue([{ id: 1, user_id: 'user123' }]),
    create: jest.fn().mockResolvedValue({ id: 1 }),
    update: jest.fn().mockResolvedValue({ id: 1, status: true }),
    delete: jest.fn().mockResolvedValue({ id: 1 }),
  },
  service: {
    findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'service1' }),
  },
  reaction: {
    findUnique: jest.fn().mockResolvedValue({ id: 1, service_id: 1 }),
    findMany: jest.fn().mockResolvedValue([{ id: 1 }]),
  },
  area_reaction: {
    findMany: jest.fn().mockResolvedValue([{ area_id: 1, reaction_id: 1 }]),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  action: {
    findUnique: jest.fn().mockResolvedValue({ id: 1, service_id: 1 }),
  },
  token: {
    findMany: jest.fn().mockResolvedValue([{ id: 1, user_id: 'user123', token: 'token123' }]),
  },
};

// Mock pour UserInfos
const mockUserInfos = {
  fetchUserInfosFromUserid: jest.fn().mockResolvedValue({ provider: 'provider', user_id: 'user123' }),
};

// Crée une instance du service avec les mocks
const service = new AreaService(mockPrismaService as any);

describe('AreaService ', () => {

  test('Appel de checkEmailContent', () => {
    const email = { subject: 'Test', body: 'Content', from: 'from@example.com', to: 'to@example.com' };
    const area = { parameters: JSON.stringify(JSON.stringify(email)) };

    service.checkEmailContent(email, area);

  });

  // test('Appel de launchFunctionForArea', async () => {
  //   mockUserInfos.fetchUserInfosFromUserid.mockResolvedValueOnce({ provider: 'provider', user_id: 'user123', refresh_token: 'mockRefreshToken' });
  //   // await service.launchFunctionForArea(100, mockUserInfos as any);
  // });

  test('Appel de getAreaAction', async () => {
    await service.getAreaAction('user123');

  });

  test('Appel de getAreaReaction', async () => {
    await service.getAreaReaction('user123');
  });

  test('Appel de postArea', async () => {
    await service.postArea(
      1,
      [1],
      [{}],
      'user123',
      'Test Area',
      {},
      'Description'
    );

  });

  test('Appel de putArea', async () => {
    await service.putArea(1, 1, 'user123');

  });

  test('Appel de deleteArea', async () => {
    await service.deleteArea(1, 'user123');

  });
});
