import { Module } from '@nestjs/common';
import { GoogleModule } from './google/google.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ServiceService } from './service.service';
import { MicrosoftModule } from './microsoft/microsoft.module';
import { GithubModule } from './github/github.module';
import { DropboxModule } from './dropbox/dropbox.module';
import { TwitchModule } from './twitch/twitch.module';
import { RssService } from './rss/rss.service';
import { RssModule } from './rss/rss.module';

@Module({
  imports: [
    GoogleModule,
    PrismaModule,
    MicrosoftModule,
    GithubModule,
    DropboxModule,
    TwitchModule,
    RssModule,
  ],
  providers: [ServiceService, RssService],
})
export class ServiceModule {}
