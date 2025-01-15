// service.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ServiceService } from './service.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';

describe('ServiceService', () => {
  let service: ServiceService;
  let prismaService: PrismaService;
  let userInfos: UserInfos;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceService,
        {
          provide: PrismaService,
          useValue: {
            service: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: UserInfos,
          useValue: {
            fetchUserService: jest.fn(),
            fetchMainUserProvider: jest.fn(),
            fetchEmails: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServiceService>(ServiceService);
    prismaService = module.get<PrismaService>(PrismaService);
    userInfos = module.get<UserInfos>(UserInfos);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all services', async () => {
      const mockServices = [{ id: 1, name: 'service1', display_name: 'Microsoft', icon: 'test' }, { id: 2, name: 'service2', display_name: 'Microsoft', icon: 'test' }];
      jest.spyOn(prismaService.service, 'findMany').mockResolvedValue(mockServices);

      const result = await service.getAll();

      expect(result).toEqual(mockServices);
      expect(prismaService.service.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUser', () => {
    it('should return user services with connection and unlinkable status', async () => {
      const user_id = 'user123';
      const mockServices = [{ id: 1, name: 'service1', display_name: 'Microsoft', icon: 'test' }, { id: 2, name: 'service2', display_name: 'Microsoft', icon: 'test' }];
      const userServices = ['service1'];
      const mainProvider = 'service1';

      jest.spyOn(prismaService.service, 'findMany').mockResolvedValue(mockServices);
      jest.spyOn(userInfos, 'fetchUserService').mockResolvedValue(userServices);
      jest.spyOn(userInfos, 'fetchMainUserProvider').mockResolvedValue(mainProvider);
      jest.spyOn(userInfos, 'fetchEmails').mockResolvedValue(['test@example.com']);

      const result = await service.getUser(user_id, userInfos);

      expect(result).toEqual([
        { id: 1, name: 'service1', display_name: 'Microsoft', icon: 'test', email: 'test@example.com', connected: 1, unlinkable: false },
        { id: 2, name: 'service2', display_name: 'Microsoft', icon: 'test', email: undefined, connected: 0, unlinkable: true },
      ]);
      expect(prismaService.service.findMany).toHaveBeenCalledTimes(1);
      expect(userInfos.fetchUserService).toHaveBeenCalledWith(user_id);
      expect(userInfos.fetchMainUserProvider).toHaveBeenCalledWith(user_id);
    });
  });
});
