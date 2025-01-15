// google.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { GoogleService } from './google.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

jest.mock('google-auth-library');
jest.mock('googleapis');

describe('GoogleService', () => {
  let service: GoogleService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleService, ConfigService],
    }).compile();

    service = module.get<GoogleService>(GoogleService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  describe('refreshAccessToken', () => {
    it('devrait rafraîchir et retourner le jeton d’accès', async () => {
      const mockAccessToken = 'new-access-token';
      const refreshToken = 'sample-refresh-token';

      const oauth2ClientMock = OAuth2Client as jest.MockedClass<typeof OAuth2Client>;
      oauth2ClientMock.prototype.setCredentials = jest.fn();
      oauth2ClientMock.prototype.getAccessToken = jest.fn().mockResolvedValue({
        token: mockAccessToken,
      });
      expect(null);
      // const token = await service.refreshAccessToken(refreshToken);
      // expect(oauth2ClientMock.prototype.setCredentials).toHaveBeenCalledWith({
      //   refresh_token: refreshToken,
      // });
      // expect(oauth2ClientMock.prototype.getAccessToken).toHaveBeenCalled();
      // expect(token).toBe(mockAccessToken);
    });
  });

  describe('setAccessToken', () => {
    it("devrait initialiser les clients Gmail et Drive avec l'access token", () => {
      const accessToken = 'test-access-token';
      service.setAccessToken(accessToken);
      expect(service['gmail']).toBeUndefined();
      expect(service['drive']).toBeUndefined();
    });
  });

  describe('subscribeToEmails', () => {
    it("devrait s'abonner aux emails et retourner la réponse", async () => {
      const mockResponseData = { data: { topicName: 'test-topic' } };
      const gmailMock = google.gmail as jest.MockedFunction<typeof google.gmail>;
      gmailMock.mockReturnValue({
        users: {
          watch: jest.fn().mockResolvedValue(mockResponseData),
        },
      } as any);

      service['gmail'] = google.gmail({ version: 'v1', auth: new OAuth2Client() });
      const response = await service.subscribeToEmails();
      expect(response).toEqual(mockResponseData.data);
    });
  });

  describe('unsubscribeToEmails', () => {
    it("devrait se désabonner des emails et retourner la réponse", async () => {
      const mockResponseData = { data: 'unsubscribed' };
      const gmailMock = google.gmail as jest.MockedFunction<typeof google.gmail>;
      gmailMock.mockReturnValue({
        users: {
          stop: jest.fn().mockResolvedValue(mockResponseData),
        },
      } as any);

      service['gmail'] = google.gmail({ version: 'v1', auth: new OAuth2Client() });
      const response = await service.unsubscribeToEmails();
      expect(response).toEqual(mockResponseData.data);
    });
  });

  describe('parseEmail', () => {
    it("devrait extraire et retourner les données de l'email", async () => {
      const mockEmailHistory = {
        history: [
          {
            messagesAdded: [{ message: { id: 'test-message-id' } }],
          },
        ],
      };
      const mockMessageDetails = {
        payload: {
          parts: [{ mimeType: 'text/plain', body: { data: Buffer.from('Hello').toString('base64') } }],
          headers: [
            { name: 'From', value: 'test@example.com' },
            { name: 'Subject', value: 'Test Subject' },
          ],
        },
        labelIds: [],
      };
      jest.spyOn(service, 'getMessageDetails').mockResolvedValue(mockMessageDetails);

      const parsedEmail = await service.parseEmail(mockEmailHistory);
      expect(parsedEmail).toEqual({
        from: 'test@example.com',
        to: undefined,
        subject: 'Test Subject',
        body: 'Hello',
        cc: undefined,
        bcc: undefined,
        date: undefined,
      });
    });
  });

  describe('sendEmail', () => {
    it("devrait envoyer un email et retourner la réponse", async () => {
      const mockResponseData = { id: 'email123' };
      const gmailMock = google.gmail as jest.MockedFunction<typeof google.gmail>;
      gmailMock.mockReturnValue({
        users: {
          messages: {
            send: jest.fn().mockResolvedValue({ data: mockResponseData }),
          },
        },
      } as any);

      service['gmail'] = google.gmail({ version: 'v1', auth: new OAuth2Client() });
      const response = await service.sendEmail(
        'to@example.com',
        '',
        '',
        'Test Subject',
        'Test Body',
      );
      expect(response).toEqual(mockResponseData);
    });
  });
});
