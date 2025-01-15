import { Module } from '@nestjs/common';
import { DropboxController } from './dropbox.controller';
import { DropboxService } from './dropbox.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

@Module({
  controllers: [DropboxController],
  providers: [DropboxService, PrismaService, UserInfos, AreaService],
})
export class DropboxModule {}
