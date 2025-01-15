import { Module } from '@nestjs/common';
import { RssController } from './rss.controller';
import { RssService } from './rss.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

@Module({
  controllers: [RssController],
  providers: [RssService, UserInfos, AreaService, PrismaService],
  exports: [RssService]
})
export class RssModule {}
