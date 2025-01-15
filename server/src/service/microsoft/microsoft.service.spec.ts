import { Test, TestingModule } from '@nestjs/testing';
import { MicrosoftService } from './microsoft.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MicrosoftService', () => {
  let service: MicrosoftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MicrosoftService],
    }).compile();

    service = module.get<MicrosoftService>(MicrosoftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should subscribe to mail notifications', async () => {
    const mockResponse = { data: { id: 'test-subscription-id' } };
    mockedAxios.request.mockResolvedValueOnce(mockResponse);

    const result = await service.mailSubscription('test-access-token');

    expect(result).toBe('test-subscription-id');
    expect(mockedAxios.request).toHaveBeenCalled();
  });

  it('should unsubscribe from mail notifications', async () => {
    mockedAxios.request.mockResolvedValueOnce({ data: 'unsubscribed' });

    await expect(service.mailUnsubscription('test-access-token', 'subscription-id')).resolves.not.toThrow();
    expect(mockedAxios.request).toHaveBeenCalled();
  });

  it('should check emails', async () => {
    const mockEmailData = { data: { subject: 'Test Subject', body: { content: 'Test Body' } } };
    mockedAxios.request.mockResolvedValueOnce(mockEmailData);

    const result = await service.checkEmails('test-email-id', 'test-access-token');

    expect(result).toEqual({ subject: 'Test Subject', body: 'Test Body' });
    expect(mockedAxios.request).toHaveBeenCalled();
  });

  it('should return null when checking emails if there is an error', async () => {
    mockedAxios.request.mockRejectedValueOnce(new Error('Request failed'));

    const result = await service.checkEmails('invalid-email-id', 'test-access-token');

    expect(result).toBeNull();
    expect(mockedAxios.request).toHaveBeenCalled();
  });

  it('should refresh access token', async () => {
    const mockTokenResponse = {
      data: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      },
    };
    mockedAxios.request.mockResolvedValueOnce(mockTokenResponse);

    const result = await service.refreshAccessToken('test-refresh-token');

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    expect(mockedAxios.request).toHaveBeenCalled();
  });

  it('should return null if refresh token is invalid', async () => {
    const mockError = {
      response: { data: { error: 'invalid_grant' } },
    };
    mockedAxios.request.mockRejectedValueOnce(mockError);

    const result = await service.refreshAccessToken('invalid-refresh-token');

    expect(result).toBeNull();
    expect(mockedAxios.request).toHaveBeenCalled();
  });

  it('should add an event to the calendar', async () => {
    const mockEventResponse = { data: { id: 'event-id' } };
    mockedAxios.request.mockResolvedValueOnce(mockEventResponse);

    const event = { subject: 'Meeting', start: { dateTime: '2023-11-01T10:00:00', timeZone: 'UTC' }, end: { dateTime: '2023-11-01T11:00:00', timeZone: 'UTC' } };
    const result = await service.addEventToCalendar('test-access-token', event);

    expect(result).toBe('event-id');
    expect(mockedAxios.request).toHaveBeenCalled();
  });
});
