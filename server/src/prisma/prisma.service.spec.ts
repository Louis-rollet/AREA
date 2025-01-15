// prisma.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    // Mock des méthodes de connexion et déconnexion de Prisma
    prismaService.$connect = jest.fn();
    prismaService.$disconnect = jest.fn();
  });

  it('devrait être défini', () => {
    expect(prismaService).toBeDefined();
  });

  it('devrait appeler $connect lors de l’initialisation du module', async () => {
    await prismaService.onModuleInit();
    expect(prismaService.$connect).toHaveBeenCalled();
  });

  it('devrait appeler $disconnect lors de la destruction du module', async () => {
    await prismaService.onModuleDestroy();
    expect(prismaService.$disconnect).toHaveBeenCalled();
  });
});
