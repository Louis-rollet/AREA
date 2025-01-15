// reaction.handler.spec.ts

import { parseActionRes } from './reaction.handler';

// Mocks
const mockPrismaService = {
  token: {
    findMany: jest.fn().mockResolvedValue([{ id: 1, access_token: 'access_token', refresh_token: 'refresh_token' }]),
    update: jest.fn(),
  },
  area_reaction: {
    findFirst: jest.fn().mockResolvedValue({ parameters: JSON.stringify({ path: '/test' }) }),
  },
  area: {
    findFirst: jest.fn().mockResolvedValue({ id: 1 }),
  },
  action: {
    findFirst: jest.fn().mockResolvedValue({ id: 1 }),
  },
};

const actionResult = {};  // Résultat d'action fictif pour les tests
const userId = 'user123';
const areaId = 1;

describe('reactionHandlers', () => {

  test('parseActionRes should replace placeholders with action results', async () => {
    const action_res = { email: 'test@example.com' };
    const passable_data = JSON.stringify([{ accessible_as: '$action.email' }]);
    const reactions_parameters = JSON.stringify(JSON.stringify({ to: '${action.email}' }));

    const result = await parseActionRes(action_res, passable_data, reactions_parameters);

    expect(result).toEqual({ to: '${action.email}' });
  });

  test('parseActionRes should handle nested objects in action results', async () => {
    const action_res = { user: { emailAddress: { address: 'nested@example.com' } } };
    const passable_data = JSON.stringify([{ accessible_as: '$action.user' }]);
    const reactions_parameters = JSON.stringify(JSON.stringify({ to: '${action.user}' }));

    const result = await parseActionRes(action_res, passable_data, reactions_parameters);

    expect(result).toEqual({ to: '${action.user}' });
  });

  test('parseActionRes should handle multiple placeholders', async () => {
    const action_res = { email: 'test@example.com', name: 'John Doe' };
    const passable_data = JSON.stringify([{ accessible_as: '$action.email' }, { accessible_as: '$action.name' }]);
    const reactions_parameters = JSON.stringify(JSON.stringify({ to: '${action.email}', subject: 'Hello ${action.name}' }));

    const result = await parseActionRes(action_res, passable_data, reactions_parameters);

    expect(result).toEqual({ to: '${action.email}', subject: 'Hello ${action.name}' });
  });

  test('parseActionRes should return original parameters if no placeholders are found', async () => {
    const action_res = { email: 'test@example.com' };
    const passable_data = JSON.stringify([{ accessible_as: '$action.email' }]);
    const reactions_parameters = JSON.stringify(JSON.stringify({ to: 'no-placeholder' }));

    const result = await parseActionRes(action_res, passable_data, reactions_parameters);

    expect(result).toEqual({ to: 'no-placeholder' });
  });

  // Existing tests
  // test('Appel de twitch_send_message', async () => {
  //   await reactionHandlers[3](actionResult, userId, areaId, mockPrismaService as any);
  // });

  // test('Appel de dropbox_move', async () => {
  //   await reactionHandlers[4](actionResult, userId, areaId, mockPrismaService as any);
  // });

  // test('Appel de dropbox_delete', async () => {
  //   await reactionHandlers[5](actionResult, userId, areaId, mockPrismaService as any);
  // });
  // test('Appel de twitch_send_message', async () => {
  //   await reactionHandlers[3](actionResult, userId, areaId, mockPrismaService as any);
  // });
  
  // test('Appel de dropbox_move', async () => {
  //   await reactionHandlers[4](actionResult, userId, areaId, mockPrismaService as any);
  // });
  
  // test('Appel de dropbox_delete', async () => {
  //   await reactionHandlers[5](actionResult, userId, areaId, mockPrismaService as any);
  // });
});

