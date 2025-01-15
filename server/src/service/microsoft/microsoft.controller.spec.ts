import { Test, TestingModule } from '@nestjs/testing';
import { MicrosoftController } from './microsoft.controller';
import { MicrosoftService } from './microsoft.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

describe('MicrosoftController', () => {
  let controller: MicrosoftController;
  let microsoftService: MicrosoftService;
  let prismaService: PrismaService;
  let userInfos: UserInfos;
  let areaService: AreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicrosoftController],
      providers: [
        MicrosoftService,
        PrismaService,
        UserInfos,
        AreaService,
      ],
    }).compile();

    controller = module.get<MicrosoftController>(MicrosoftController);
    microsoftService = module.get<MicrosoftService>(MicrosoftService);
    prismaService = module.get<PrismaService>(PrismaService);
    userInfos = module.get<UserInfos>(UserInfos);
    areaService = module.get<AreaService>(AreaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should handle mailCallback with validationToken', async () => {
    const req: any = { query: { validationToken: 'test-token' }, body: { value: [{}] } };
    const res: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    
    await controller.mailCallback(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('test-token');
  });

  it('should handle mailCallback when changeType is not "created"', async () => {
    const req: any = { query: {}, body: { value: [{ changeType: 'updated' }] } };
    const res: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await controller.mailCallback(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('OK');
  });

  it('should handle mailCallback with no areas found', async () => {
    const req: any = { query: {}, body: { value: [{ changeType: 'created', subscriptionId: 'sub-id' }] } };
    const res: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    jest.spyOn(prismaService.area, 'findMany').mockResolvedValueOnce([]);

    await controller.mailCallback(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('No Area found');
  });

  it('should handle mailCallback with no identity found', async () => {
    const req: any = { query: {}, body: { value: [{ changeType: 'created', subscriptionId: 'sub-id' }] } };
    const res: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    jest.spyOn(userInfos, 'fetchUserInfosFromUserid').mockResolvedValueOnce(null);

    await controller.mailCallback(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('No Area found');
  });

  it('should handle mailCallback with no token found', async () => {
    const req: any = { query: {}, body: { value: [{ changeType: 'created', subscriptionId: 'sub-id' }] } };
    const res: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    jest.spyOn(userInfos, 'fetchUserInfosFromUserid').mockResolvedValueOnce({ provider: 'provider', user_id: 'user_id' });
    jest.spyOn(prismaService.token, 'findMany').mockResolvedValueOnce([]);

    await controller.mailCallback(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('No Area found');
  });

  it('should handle mailCallback with no access token found', async () => {
    const req: any = { query: {}, body: { value: [{ changeType: 'created', subscriptionId: 'sub-id' }] } };
    const res: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    jest.spyOn(userInfos, 'fetchUserInfosFromUserid').mockResolvedValueOnce({ provider: 'provider', user_id: 'user_id' });
    jest.spyOn(microsoftService, 'refreshAccessToken').mockResolvedValueOnce(null);

    await controller.mailCallback(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('No Area found');
  });

  it('should handle mailCallback with no email found', async () => {
    const req: any = { query: {}, body: { value: [{ changeType: 'created', subscriptionId: 'sub-id', resource: 'resource-id' }] } };
    const res: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    jest.spyOn(userInfos, 'fetchUserInfosFromUserid').mockResolvedValueOnce({ provider: 'provider', user_id: 'user_id' });
    jest.spyOn(microsoftService, 'refreshAccessToken').mockResolvedValueOnce({ accessToken: 'access_token', refreshToken: 'new_refresh_token' });
    jest.spyOn(microsoftService, 'checkEmails').mockResolvedValueOnce(null);

    await controller.mailCallback(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('No Area found');
  });

  it('should handle mailCallback and process emails', async () => {
    const req: any = { query: {}, body: { value: [{ changeType: 'created', subscriptionId: 'sub-id', resource: 'resource-id' }] } };
    const res: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    jest.spyOn(userInfos, 'fetchUserInfosFromUserid').mockResolvedValueOnce({ provider: 'provider', user_id: 'user_id' });
    jest.spyOn(microsoftService, 'refreshAccessToken').mockResolvedValueOnce({ accessToken: 'access_token', refreshToken: 'new_refresh_token' });
    jest.spyOn(prismaService.area_reaction, 'findMany').mockResolvedValueOnce([]);
    jest.spyOn(areaService, 'launchReactionFunctionForArea').mockResolvedValueOnce(undefined);

    await controller.mailCallback(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('No Area found');
  });
});
