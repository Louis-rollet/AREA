import { Controller, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MicrosoftService } from './microsoft.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfos } from 'src/auth/auth.service';
import { AreaService } from 'src/area/area.service';

@ApiTags('Microsoft')
@Controller('microsoft')
export class MicrosoftController {
  constructor(private readonly microsoftService: MicrosoftService, 
    private prisma: PrismaService,
    private userinfo: UserInfos,
    private AreaService: AreaService,
  ) {}

  @Post('mail-webhook')
  async mailCallback(@Req() req, @Res() res) {
    
    if (req.query.validationToken) {
      return res.status(200).send(req.query.validationToken);
    }
    
    const decodedMessage = req.body.value[0];

    console.log('decodedMessage', decodedMessage);

     if (decodedMessage.changeType !== 'created') {
      return res.status(200).send('OK');
    }
    

    const areas = await this.prisma.area.findMany({
      where: {
        action_id: 4,
        last_state_token: decodedMessage.subscriptionId,
      },
    });

    console.log('areas', areas);

    if (!areas || areas.length === 0) {
      return res.status(200).send('No Area found');
    }

    const identity = await this.userinfo.fetchUserInfosFromUserid(areas[0].user_id, 'windowslive');

    if (!identity) {
      return res.status(200).send('No identity found');
    }

    const tokens = await this.prisma.token.findMany({
      where: {
        user_id: identity.provider + '|' + identity.user_id,
      },
    });


    if (!tokens || tokens.length === 0) {
      return res.status(200).send('No token found');
    }

    const token = tokens[0];

    const all_token = await this.microsoftService.refreshAccessToken(token.refresh_token);

    if (!all_token) {
      return res.status(200).send('No access token found');
    }

    const { accessToken, refreshToken } = all_token;

    await this.prisma.token.update({
      where: { id: token.id },
      data: { access_token: accessToken, refresh_token: refreshToken },
    });

    const emails = await this.microsoftService.checkEmails(decodedMessage.resource, accessToken);

    console.log('emails', emails);

    if (!emails) {
      return res.status(200).send('No email found');
    }

    const reactions = await this.prisma.area_reaction.findMany({
      where: { area_id: areas[0].id },
    });

    if (!this.AreaService.checkEmailContent(emails, areas[0])) {
      return res.status(200).send('No new emails');
    }

    await this.AreaService.launchReactionFunctionForArea(
      reactions,
      emails,
      areas[0].user_id,
      this.userinfo
    );

    return res.status(200).send('OK');
  }
}
