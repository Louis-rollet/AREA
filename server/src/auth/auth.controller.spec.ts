// auth.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService, UserInfos } from './auth.service';
import { HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: { ...mockAuthService, ...mockUserInfos } },
        ConfigService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  const mockAuthService = {
    Redirect: jest.fn(),
    Customredirect: jest.fn(),
    handleCallback: jest.fn(),
    linkAccounts: jest.fn(),
    UnlinkAccounts: jest.fn(),
  };

  const mockUserInfos = {
    fetchUserInfo: jest.fn(),
  };

  it('devrait rediriger vers Auth0 pour login', () => {
    const mockReq = { query: { platform: 'web' } };
    const mockRes = { redirect: jest.fn() };
    mockAuthService.Redirect.mockReturnValue('redirect-url');

    controller.login(mockReq, mockRes);
  });

  it('devrait rediriger vers une connexion personnalisée', () => {
    const mockReq = { query: { token: 'token123', connection: 'github' } };
    const mockRes = { redirect: jest.fn() };
    mockAuthService.Customredirect.mockReturnValue('custom-redirect-url');

    controller.custom(mockReq, mockRes);

    expect(mockAuthService.Customredirect).toHaveBeenCalledWith('github', 'token123');
    expect(mockRes.redirect).toHaveBeenCalledWith('custom-redirect-url');
  });

  it('devrait gérer le callback Auth0', async () => {
    const mockReq = { query: { code: 'code123', platform: 'web' } };
    const mockRes = { redirect: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
    mockAuthService.handleCallback.mockResolvedValue('accessToken123');

    await controller.callback(mockReq, mockRes);

    expect(mockAuthService.handleCallback).toHaveBeenCalledWith('code123');
    expect(mockRes.redirect).toHaveBeenCalledWith(`${process.env.FRONT_REDIRECT_URL}/#/callback?access_token=accessToken123`);
  });

  it('devrait gérer le callback personnalisé pour Github', async () => {
    const mockReq = { query: { code: 'code123', access_token: 'token123' } };
    const mockRes = { send: jest.fn(), status: jest.fn().mockReturnThis() };
    const decodedToken = { sub: 'user123' };

    // Utilisez jest.spyOn pour simuler jwt.decode
    jest.spyOn(jwt, 'decode').mockReturnValue(decodedToken);

    mockAuthService.handleCallback.mockResolvedValue('newAccessToken123');
    mockAuthService.linkAccounts.mockResolvedValue('Linked');

    await controller.authGithub(mockReq, mockRes);

    expect(mockAuthService.handleCallback).toHaveBeenCalledWith('code123');
    expect(mockAuthService.linkAccounts).toHaveBeenCalledWith('user123', 'newAccessToken123');
    expect(mockRes.send).toHaveBeenCalledWith('Linked, Please close the window');
  });

  it('devrait retourner le profil de l’utilisateur', async () => {
    const mockReq = { auth: { sub: 'user123' } };
    const mockRes = { json: jest.fn() };
    const mockUserInfo = { name: 'John Doe', email: 'john@example.com' };

    mockUserInfos.fetchUserInfo.mockResolvedValue(mockUserInfo);

    await controller.profile(mockReq, mockRes);

    // expect(mockUserInfos.fetchUserInfo).toHaveBeenCalledWith('user123');
    expect(mockRes.json).toHaveBeenCalledWith(null);
  });

  it('devrait rediriger vers la page d’accueil pour logout', () => {
    const mockReq = { query: {}, logout: jest.fn((callback) => callback()) };
    const mockRes = { redirect: jest.fn() };

    controller.logout(mockReq, mockRes);

    expect(mockReq.logout).toHaveBeenCalled();
    expect(mockRes.redirect).toHaveBeenCalledWith('https://dev-e0yvfbl4ip7rdhmm.us.auth0.com/v2/logout?client_id=bksFHneh6sOFjeLCBVVSekmyGRi1lGvP&returnTo=https%3A%2F%2Flouis.yt%2F');
  });

  it('devrait délier un compte utilisateur', async () => {
    const mockReq = { auth: { sub: 'user123' }, body: { service: 'github' } };
    const mockRes = { send: jest.fn(), status: jest.fn().mockReturnThis() };

    mockAuthService.UnlinkAccounts.mockResolvedValue('Unlinked');

    await controller.unlink(mockReq, mockRes);

    expect(mockAuthService.UnlinkAccounts).toHaveBeenCalledWith('user123', 'github');
    expect(mockRes.send).toHaveBeenCalledWith('Unlinked');
  });

  it('devrait vérifier si l’utilisateur est connecté', () => {
    const mockReq = { isAuthenticated: jest.fn().mockReturnValue(true) };
    const mockRes = { send: jest.fn() };

    controller.index(mockReq, mockRes);

    expect(mockRes.send).toHaveBeenCalledWith('Logged in');
  });
});
