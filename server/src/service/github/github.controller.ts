import { Controller, Post, Req, Res } from '@nestjs/common';
import { GithubService } from './github.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

@Controller('github')
export class GithubController {
    constructor(private readonly githubService: GithubService,
        private readonly prisma: PrismaService,
        private readonly userinfos: UserInfos,
        private readonly AreaService: AreaService) {}

    @Post('github-webhook-push')
    async githubWebhookPush(@Req() req: any, @Res() res: any) {
        console.log('Github webhook push:', req.body);

        const webhookPayload = req.body;

        const areas = await this.prisma.area.findMany({
            where: {
                action_id: 2,
                status: true,
            },
        });

        for (const area of areas) {
            const result = this.githubService.parseGithubPush(webhookPayload, area.parameters);

            if (result) {
                const reaction = await this.prisma.area_reaction.findMany({
                    where: {
                        area_id: area.id,
                    },
                });
                await this.AreaService.launchReactionFunctionForArea(
                    reaction,
                    result,
                    area.user_id,
                    this.userinfos,
                );
            }
        }

        res.send('ok');
    }

    @Post('github-webhook-star')
    async githubWebhookStar(@Req() req: any, @Res() res: any) {
        console.log('Github webhook stared:', req.body);

        const webhookPayload = req.body;

        const areas = await this.prisma.area.findMany({
            where: {
                action_id: 3,
                status: true,
            },
        });

        for (const area of areas) {
            const result = this.githubService.parseGithubStar(webhookPayload, area.parameters);

            console.log('Result:', result);

            if (result) {
                const reaction = await this.prisma.area_reaction.findMany({
                    where: {
                        area_id: area.id,
                    },
                });
                await this.AreaService.launchReactionFunctionForArea(
                    reaction,
                    result,
                    area.user_id,
                    this.userinfos,
                );
            }
        }

        res.send('ok');
    }

}
