import { Module } from '@nestjs/common';
import { AuthService, UserInfos } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth0Strategy } from './auth0.strategy';
import { AreaModule } from 'src/area/area.module';
import { TokenService } from 'src/area/token/token.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [AreaModule],
  providers: [
    AuthService,
    Auth0Strategy,
    UserInfos,
    TokenService,
    PrismaService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
