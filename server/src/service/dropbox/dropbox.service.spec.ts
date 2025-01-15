// dropbox.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DropboxService } from './dropbox.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('DropboxService', () => {
  let service: DropboxService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    token: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DropboxService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DropboxService>(DropboxService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Transformation de `fetch` en mock
    global.fetch = jest.fn() as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  describe('dropboxGetCursorListFolder', () => {
    it('devrait retourner un cursor', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ cursor: 'testCursor' }),
      });

      const cursor = await service.dropboxGetCursorListFolder('testToken');
      expect(cursor).toBe('testCursor');
    });
  });

  describe('dropboxListFolderContinue', () => {
    it('devrait retourner les données de liste continue de Dropbox', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ entries: [{ id: 'entry1' }], cursor: 'newCursor' }),
      });
    });
  });

  describe('dropboxMove', () => {
    it('devrait appeler l’API Dropbox pour déplacer un fichier', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await service.dropboxMove('testToken', '/from/path', '/to/path');
    });
  });

  describe('dropboxDelete', () => {
    it('devrait appeler l’API Dropbox pour supprimer un fichier', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await service.dropboxDelete('testToken', '/file/path');
    });
  });
});
