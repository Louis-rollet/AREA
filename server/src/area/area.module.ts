import { Module } from '@nestjs/common';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserInfos } from 'src/auth/auth.service';
import { ServiceService } from 'src/service/service.service';
import { ActionService } from './action/action.service';
import { TokenService } from './token/token.service';
import { ReactionService } from './reaction/reaction.service';
import { ActionController } from './action/action.controller';
import { ReactionController } from './reaction/reaction.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [
    AreaService,
    AreaController,
    UserInfos,
    ServiceService,
    ActionService,
    TokenService,
    ReactionService,
    PrismaService,
  ],
  controllers: [AreaController, ActionController, ReactionController],
  exports: [AreaService],
})
export class AreaModule {}
