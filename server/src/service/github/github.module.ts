import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

@Module({
  providers: [PrismaService, GithubService, UserInfos, AreaService],
  controllers: [GithubController],
  exports: [GithubService],
})
export class GithubModule {}
