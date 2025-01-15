import { Module } from '@nestjs/common';
import { MicrosoftController } from './microsoft.controller';
import { MicrosoftService } from './microsoft.service';
import { TokenService } from 'src/area/token/token.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

@Module({
  controllers: [MicrosoftController],
  providers: [MicrosoftService, TokenService, PrismaService,UserInfos, AreaService],
})
export class MicrosoftModule {}
