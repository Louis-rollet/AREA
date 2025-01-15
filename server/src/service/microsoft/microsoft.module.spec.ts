import { Test, TestingModule } from '@nestjs/testing';
import { MicrosoftModule } from './microsoft.module';
import { MicrosoftController } from './microsoft.controller';
import { MicrosoftService } from './microsoft.service';
import { TokenService } from 'src/area/token/token.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

describe('MicrosoftModule', () => {
  let microsoftController: MicrosoftController;
  let microsoftService: MicrosoftService;
  let tokenService: TokenService;
  let prismaService: PrismaService;
  let userInfos: UserInfos;
  let areaService: AreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MicrosoftModule],
    }).compile();

    microsoftController = module.get<MicrosoftController>(MicrosoftController);
    microsoftService = module.get<MicrosoftService>(MicrosoftService);
    tokenService = module.get<TokenService>(TokenService);
    prismaService = module.get<PrismaService>(PrismaService);
    userInfos = module.get<UserInfos>(UserInfos);
    areaService = module.get<AreaService>(AreaService);
  });

  it('should be defined', () => {
    expect(microsoftController).toBeDefined();
    expect(microsoftService).toBeDefined();
    expect(tokenService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(userInfos).toBeDefined();
    expect(areaService).toBeDefined();
  });
});
