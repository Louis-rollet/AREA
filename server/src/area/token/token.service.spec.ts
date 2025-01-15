// token.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('TokenService', () => {
  let service: TokenService;
  let prisma: PrismaService;

  const mockPrismaService = {
    token: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    area: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  it('devrait récupérer tous les tokens', async () => {
    const mockTokens = [{ id: 1, user_id: 'user123' }];
    mockPrismaService.token.findMany.mockImplementation(() => Promise.resolve(mockTokens));

    const tokens = await service.getTokens();
    expect(tokens).toEqual(mockTokens);
    expect(mockPrismaService.token.findMany).toHaveBeenCalled();
  });

  it('devrait récupérer un token par ID', async () => {
    const mockToken = { id: 1, user_id: 'user123' };
    mockPrismaService.token.findUnique.mockImplementation(() => Promise.resolve(mockToken));

    const token = await service.getTokensById(1);
    expect(token).toEqual(mockToken);
    expect(mockPrismaService.token.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('devrait récupérer les tokens par user_id', async () => {
    const mockTokens = [{ id: 1, user_id: 'user123' }];
    mockPrismaService.token.findMany.mockImplementation(() => Promise.resolve(mockTokens));

    const tokens = await service.getTokensByUserId('user123');
    expect(tokens).toEqual(mockTokens);
    expect(mockPrismaService.token.findMany).toHaveBeenCalledWith({ where: { user_id: 'user123' } });
  });

  it('devrait créer un nouveau token si aucun n’existe', async () => {
    mockPrismaService.token.findMany.mockImplementation(() => Promise.resolve([]));
    const mockNewToken = { id: 1, user_id: 'user123', access_token: 'access', refresh_token: 'refresh' };
    mockPrismaService.token.create.mockImplementation(() => Promise.resolve(mockNewToken));

    const token = await service.postTokens('user123', 'access', 'refresh');
    expect(token).toEqual(mockNewToken);
    expect(mockPrismaService.token.create).toHaveBeenCalledWith({
      data: {
        user_id: 'user123',
        access_token: 'access',
        refresh_token: 'refresh',
      },
    });
  });

  it('devrait mettre à jour le refresh_token et access_token si le user_id existe déjà', async () => {
    const existingTokens = [{ id: 1, user_id: 'user123' }];
    mockPrismaService.token.findMany.mockImplementation(() => Promise.resolve(existingTokens));

    await service.postTokens('user123', 'new_access', 'new_refresh');
    expect(mockPrismaService.token.updateMany).toHaveBeenCalledWith({
      where: { user_id: 'user123' },
      data: { access_token: 'new_access' },
    });
    expect(mockPrismaService.token.updateMany).toHaveBeenCalledWith({
      where: { user_id: 'user123' },
      data: { refresh_token: 'new_refresh' },
    });
  });

  it('devrait supprimer tous les tokens par user_id', async () => {
    mockPrismaService.token.deleteMany.mockImplementation(() => Promise.resolve({ count: 1 }));

    const result = await service.deleteTokens('user123');
    expect(result).toEqual({ count: 1 });
    expect(mockPrismaService.token.deleteMany).toHaveBeenCalledWith({ where: { user_id: 'user123' } });
  });

  it('devrait mettre à jour le dernier état du token', async () => {
    const mockUpdatedArea = { id: 1, last_state_token: 'new_state' };
    mockPrismaService.area.update.mockImplementation(() => Promise.resolve(mockUpdatedArea));

    const result = await service.putlast_state_token(1, 'new_state');
    expect(result).toEqual(mockUpdatedArea);
    expect(mockPrismaService.area.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { last_state_token: 'new_state' },
    });
  });
});
