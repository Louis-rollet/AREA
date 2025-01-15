/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { DropboxService } from './dropbox.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

@Controller('dropbox')
export class DropboxController {
    constructor(private readonly dropboxService: DropboxService,
        private readonly prisma: PrismaService,
        private readonly userinfos: UserInfos,
        private readonly areaService: AreaService
    ) {}

    @Get('dropbox-webhook')
    async dropboxWebhook(@Req() req: any, @Res() res: any) {
        console.log('Dropbox webhook:', req.body);
        if (req.query.challenge) {
            res.send(req.query.challenge);
        } else {
            res.send('ok');
        }
    }

    @Post('dropbox-webhook')
    async dropboxWebhookPost(@Req() req: any, @Res() res: any) {
        console.log('Dropbox webhook headers:', req.headers);
        console.log('Dropbox webhook body:', req.body);
        const signature = req.headers['x-dropbox-signature'];

        for (let i = 0; req.body.delta.users.length > i; i++) {
            const areas = await this.prisma.area.findMany({
                where: {
                    action_id: 5,
                },
            });
            if (!areas) {
                return;
            }
            for (const area of areas) {
                console.log(req.body.delta.users[i].toString());
                const all_identities = await this.userinfos.fetchUserAllIdentities(area.user_id);
                // console.log(all_identities);
                for (const identity of all_identities) {
                    if (identity.provider !== 'dropbox') {
                        continue;
                    }
                    if (identity.user_id !== req.body.delta.users[i].toString()) {
                        continue;
                    }
                    console.log(identity.user_id);
                    
                    if (!area.status) {
                        continue;
                    }
                    const body = await this.dropboxService.dropboxListFolderContinue(signature, req.body.delta.users[i].toString(), area.last_state_token);
                    const entries = body.entries;

                    await this.prisma.area.update({
                        where: { id: area.id },
                        data: { last_state_token: body.cursor },
                    });

                    const params = JSON.parse(area.parameters);
                    const params_json = JSON.parse(params); 
                    const reaction = await this.prisma.area_reaction.findMany({
                        where: {
                            area_id: area.id,
                        },
                    });
                    if (this.dropboxService.validationForLauchFunctionForArea(params_json, entries)) {
                        console.log('Launch reaction function for area');

                        this.areaService.launchReactionFunctionForArea(
                            reaction,
                            {

                            },
                            area.user_id,
                            this.userinfos,
                        );
                    }
                }
            }
        }
        res.send('ok');
    }
}   
