import { Controller, Post, Req, Res } from '@nestjs/common';
import { GoogleService } from './google.service';
import { ConfigService } from '@nestjs/config';
import { AreaService } from 'src/area/area.service';
import { UserInfos } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { console } from 'inspector';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Google')
@Controller('google')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly prisma: PrismaService,
    private readonly userinfos: UserInfos,
    private readonly AreaService: AreaService,
  ) {
    this.googleService = new GoogleService(new ConfigService());
  }

  @Post('gmail-webhook')
  async gmailCallback(@Req() req, @Res() res) {
    console.log('req.body:', req.body);

    const base64Message = req.body.message.data;
    const buffer = Buffer.from(base64Message, 'base64');
    const decodedMessage = buffer.toString('utf-8');

    console.log('decodedMessage:', decodedMessage);

    const decodedMessageObj = JSON.parse(decodedMessage);

    const refreshResult = await this.googleService.refreshFromEmail(
      this.userinfos,
      decodedMessageObj,
      this.prisma,
    );

    if (!refreshResult) {
      return res.status(200).send('No new emails');
    }

    const result = Array.isArray(refreshResult)
      ? refreshResult[0]
      : refreshResult;

    if (!result.activeResults || result.activeResults.length === 0) {
      return res.status(200).send('No Area found');
    }

    const areas = result.activeResults;

    for (const area of areas) {
      const lastStateToken = area.last_state_token;
      const emails = await this.googleService.checkEmails(lastStateToken);

      console.log('id', area.id);

      await this.prisma.area.update({
        where: { id: area.id },
        data: { last_state_token: emails.historyId },
      });

      if (!emails.history || emails.history.length === 0) {
        console.log('No new emails');
        return res.status(200).send('No new emails');
      }

      const email_parse = await this.googleService.parseEmail(emails);

      if (!email_parse) {
        console.log('No new emails');
        return res.status(200).send('No new emails');
      }

      if (!this.AreaService.checkEmailContent(email_parse, area)) {
        console.log('No new emails');
        return res.status(200).send('No new emails');
      }

      if (area.status === true) {
        const reactions = await this.prisma.area_reaction.findMany({
          where: { area_id: area.id },
        });
        const userIdGoogle = Array.isArray(result)
          ? result[0].user_id_google
          : result.user_id_google;
        await this.AreaService.launchReactionFunctionForArea(
          reactions,
          email_parse,
          area.user_id,
          this.userinfos
        );
      }
    }

    return res.status(200).send('OK');
  }
}
