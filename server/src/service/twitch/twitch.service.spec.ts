// twitch.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TwitchService } from './twitch.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TwitchService', () => {
  let service: TwitchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwitchService],
    }).compile();

    service = module.get<TwitchService>(TwitchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should refresh user access token', async () => {
    const mockAccessToken = 'newAccessToken';
    mockedAxios.post.mockResolvedValueOnce({ data: { access_token: mockAccessToken } });

    const result = await service.refreshUserAccessToken('refreshToken');
    expect(result).toEqual(mockAccessToken);
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('oauth2/token'), null, expect.anything());
  });

  it('should get app access token', async () => {
    const mockAppAccessToken = 'appAccessToken';
    mockedAxios.post.mockResolvedValueOnce({ data: { access_token: mockAppAccessToken } });

    const result = await service.getAppAccessToken();
    expect(result).toEqual(mockAppAccessToken);
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('oauth2/token'), null, expect.anything());
  });

  it('should get user id from username', async () => {
    const mockUserId = '12345';
    mockedAxios.get.mockResolvedValueOnce({ data: { data: [{ id: mockUserId }] } });

    const result = await service.getUserIdFromUsername('username', 'appAccessToken');
    expect(result).toEqual(mockUserId);
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('helix/users'), expect.anything());
  });

  it('should subscribe to Twitch webhook', async () => {
    const mockSubscriptionId = 'subId123';
    mockedAxios.post.mockResolvedValueOnce({ data: { data: [{ id: mockSubscriptionId }] } });
  });

  it('should unsubscribe from Twitch webhook', async () => {
    mockedAxios.delete.mockResolvedValueOnce({});
  });

  it('should send message to Twitch channel', async () => {
    const mockChannelId = 'channelId123';
    mockedAxios.get.mockResolvedValueOnce({ data: { data: [{ id: mockChannelId }] } });
    mockedAxios.post.mockResolvedValueOnce({ data: 'messageSent' });

    await service.sendMessageToChannel('accessToken', 'channelName', 'Hello, World!', 'userId');
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('helix/users'), expect.anything());
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('chat/messages'), expect.anything(), expect.anything());
  });
});
