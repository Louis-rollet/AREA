import { Module } from '@nestjs/common';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

@Module({
  controllers: [TwitchController],
  providers: [TwitchService, PrismaService, UserInfos, AreaService],
  exports: [TwitchService],
})
export class TwitchModule {}
