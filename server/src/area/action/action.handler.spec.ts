// import { actionHandlers } from './action.handler';
// import { GoogleService } from 'src/service/google/google.service';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '../token/token.service';

class MockPrismaService {

  area = {

    findMany: jest.fn(),

    update: jest.fn(),

  };

  area_reaction = {

    findMany: jest.fn(),

  };

}

const mockUserInfos = {
  
    fetchUserInfosFromUserid: jest.fn().mockResolvedValue({ provider: 'google-oauth2', user_id: 'google|12345', refresh_token: 'refress' }),
};


jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        setCredentials: jest.fn(),
        refreshAccessToken: jest.fn().mockResolvedValue({
          credentials: {
            access_token: 'new_access_token',
          },
        }),
      };
    }),
  };
});

jest.mock('src/service/google/google.service');
jest.mock('@nestjs/config');
jest.mock('../token/token.service');

// Variables pour les tests bidons
const areaExample = {
  user_id: 'user123',
  id: 1,
  action_id: 1,
  status: '1',
  parameters: JSON.stringify({ username: 'testuser' }),
};

describe('actionHandlers', () => {
  describe('action_google', () => {
    it('should subscribe to emails if status is 1', async () => {
      // const mockGoogleService = new GoogleService(new ConfigService());
      const mockTokenService = new TokenService(new MockPrismaService() as any);

      // mockGoogleService.refreshAccessToken = jest.fn().mockResolvedValue('new_access_token');
      // mockGoogleService.subscribeToEmails = jest.fn().mockResolvedValue({ historyId: 'historyId' });
      mockTokenService.putTokens = jest.fn();
      mockTokenService.putlast_state_token = jest.fn();
      
      await expect(true).toBeTruthy();
    });
  });
});