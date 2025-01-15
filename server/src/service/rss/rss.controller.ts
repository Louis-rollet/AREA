/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { RssService } from './rss.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

@Controller('rss')
export class RssController {
    private intervalId: NodeJS.Timeout;

    constructor(
        private readonly rssservice: RssService,
        private readonly prisma: PrismaService,
        private readonly userinfos: UserInfos,
        private readonly AreaService: AreaService,
        
    ) {}

    onModuleInit() {
        this.intervalId = setInterval(() => this.check_rss(), 1000 * 60); // 60 seconds
    }

    onModuleDestroy() {
        clearInterval(this.intervalId);
    }

    async check_rss() {
        const areas = await this.prisma.area.findMany({
            where: {
                action_id: 7,
            },
        });

        if (!areas) {
            return;
        }

        for (const area of areas) {
            if (!area.status) {
                continue;
            }
            const params = JSON.parse(area.parameters);
            const params_json = JSON.parse(params);
            const rss = await this.rssservice.getRssFeed(params_json.rss_link);
            if (rss) {
                const lastItem = rss.items[0];
                console.log('Last item:', lastItem);
                if (area.last_state_token && area.last_state_token !== "" && area.last_state_token !== lastItem.link) {
                    const reaction = await this.prisma.area_reaction.findMany({
                        where: {
                            area_id: area.id,
                        },
                    });

                    await this.AreaService.launchReactionFunctionForArea(
                        reaction,
                        {
                            title: lastItem.title,
                            date: lastItem.pubDate,
                            link: lastItem.link,
                        },
                        area.user_id,
                        this.userinfos,
                    );

                    await this.prisma.area.update({
                        where: {
                            id: area.id,
                        },
                        data: {
                            last_state_token: lastItem.link,
                        },
                    });
                } else {
                    await this.prisma.area.update({
                        where: {
                            id: area.id,
                        },
                        data: {
                            last_state_token: lastItem.link,
                        },
                    });
                }
            }
        }
    }
}
