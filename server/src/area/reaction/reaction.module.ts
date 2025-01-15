import { Module } from '@nestjs/common';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { UserInfos } from 'src/auth/auth.service';

@Module({
  controllers: [ReactionController],
  providers: [ReactionService, UserInfos],
})
export class ReactionModule {}
