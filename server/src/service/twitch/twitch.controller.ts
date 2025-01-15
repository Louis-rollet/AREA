import { Controller, Post, Req, Res } from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

@Controller('twitch')
export class TwitchController {
    constructor(private readonly twitchService: TwitchService,
        private readonly prisma: PrismaService,
        private readonly userinfos: UserInfos,
        private readonly AreaService: AreaService) {}

    @Post('twitch-webhook')
    async twitchWebhook(@Req() req: any, @Res() res: any) {
        console.log('Twitch webhook:', req.body);

        const MESSAGE_TYPE_VERIFICATION = 'webhook_callback_verification';
        const MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type'.toLowerCase();
        
        let notification = req.body;

        if (MESSAGE_TYPE_VERIFICATION === req.headers[MESSAGE_TYPE]) {
            console.log('Twitch challenge:', notification.challenge);
            return res.set('Content-Type', 'text/plain').status(200).send(notification.challenge);
        }
        const areas = await this.prisma.area.findMany({
            where: {
                action_id: 6,
            },
        });

        if (!areas) {
            return res.status(200).send('No area found');
        }

        for (const area of areas) {
            if (area.status && area.last_state_token === notification.subscription.id) {
                const reaction = await this.prisma.area_reaction.findMany({
                    where: {
                        area_id: area.id,
                    },
                });

                await this.AreaService.launchReactionFunctionForArea(
                    reaction,
                    {
                        action: notification.event.type,
                        date: notification.event.started_at,
                        broadcaster: notification.event.broadcaster_user_name,
                    },
                    area.user_id,
                    this.userinfos,
                );
            }
        }

        res.send('ok');
    }
}
