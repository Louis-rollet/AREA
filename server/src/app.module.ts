import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AreaModule } from './area/area.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServiceModule } from './service/service.module';
import { ServiceService } from './service/service.service';
import { ActionService } from './area/action/action.service';
import { ReactionService } from './area/reaction/reaction.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AreaModule,
    AuthModule,
    PrismaModule,
    ServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService, ServiceService, ActionService, ReactionService],
  exports: [],
})
export class AppModule {}
