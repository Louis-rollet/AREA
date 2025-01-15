import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

@Module({
  providers: [PrismaService, GoogleService, UserInfos, AreaService],
  controllers: [GoogleController], // Add the controller here
  exports: [GoogleService],
})
export class GoogleModule {}
