/* eslint-disable prettier/prettier */
import { ConfigService } from '@nestjs/config';
import { UserInfos } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleService } from 'src/service/google/google.service';
import { TokenService } from '../token/token.service';
import { GithubService } from 'src/service/github/github.service';
import { DropboxService } from 'src/service/dropbox/dropbox.service';
import { MicrosoftService } from 'src/service/microsoft/microsoft.service';
import { TwitchService } from 'src/service/twitch/twitch.service';
import { RssService } from 'src/service/rss/rss.service';

export const actionHandlers: {
  [key: number]: (
    area: any,
    prismaService: PrismaService,
    userinfo: UserInfos,
  ) => Promise<any>;
} = {
  1: action_google,
  2: action_github_push,
  3: action_github_star,
  4: action_microsoft_mail,
  5: action_dropbox_list_folder,
  6: action_twitch,
  7: action_rss,
};

async function action_google(
  area: any,
  prismaService: PrismaService,
  userinfo: UserInfos,
) {
  const indentities = await userinfo.fetchUserInfosFromUserid(
    area.user_id,
    'google-oauth2',
  );

  console.log('Indentities from fetch:', indentities);

  let userid;
  if (indentities.length >= 2) {
    userid = indentities[0].provider + '|' + indentities[0].user_id;
  } else {
    userid = indentities.provider + '|' + indentities.user_id;
  }

  const tokens = await prismaService.token.findMany({
    where: {
      user_id: userid,
    },
  });

  if (tokens.length === 0) {
    throw new Error('User not found');
  }

  const token = tokens[0];

  const googleService = new GoogleService(new ConfigService());

  const access_token = await googleService.refreshAccessToken(
    token.refresh_token,
  );

  const tokenService = new TokenService(prismaService);

  await tokenService.putTokens(userid, access_token);

  if (area.status == '1') {
    const result = await googleService.subscribeToEmails();
    await tokenService.putlast_state_token(area.id, result.historyId);
    return result;
  } else {
    await googleService.unsubscribeToEmails();
    await tokenService.putlast_state_token(area.id, '');
    return 'Unsubscribed';
  }
}

async function action_github_push(
  area: any,
  prismaService: PrismaService,
  userinfo: UserInfos,
) {
  const indentities = await userinfo.fetchUserInfosFromUserid(
    area.user_id,
    'github',
  );

  let userid;
  if (indentities.length >= 2) {
    userid = indentities[0].provider + '|' + indentities[0].user_id;
  } else {
    userid = indentities.provider + '|' + indentities.user_id;
  }

  const tokens = await prismaService.token.findMany({
    where: {
      user_id: userid,
    },
  });

  if (tokens.length === 0) {
    throw new Error('User not found');
  }

  const token = tokens[0];

  console.log(token);

  const githubservice = new GithubService();

  if (area.status == '1') {
    console.log('Subscribing to repo webhook: ', area.parameters);
    const result = await githubservice.subscribeToRepoWebhook(
      area.parameters,
      token.access_token,
      'push',
    );
    return result;
  } else {
    console.log('Unsubscribing to repo webhook: ', area.parameters);
    await githubservice.unsubscribeToRepoWebhook(
      area.parameters,
      token.access_token,
      'push',
    );
    return 'Unsubscribed';
  }
}

async function action_github_star(
  area: any,
  prismaService: PrismaService,
  userinfo: UserInfos,
) {
  const indentities = await userinfo.fetchUserInfosFromUserid(
    area.user_id,
    'github',
  );

  let userid;
  if (indentities.length >= 2) {
    userid = indentities[0].provider + '|' + indentities[0].user_id;
  } else {
    userid = indentities.provider + '|' + indentities.user_id;
  }

  const tokens = await prismaService.token.findMany({
    where: {
      user_id: userid,
    },
  });

  if (tokens.length === 0) {
    throw new Error('User not found');
  }

  const token = tokens[0];

  console.log(token);

  const githubservice = new GithubService();

  if (area.status == '1') {
    console.log('Subscribing to repo webhook: ', area.parameters);
    const result = await githubservice.subscribeToRepoWebhook(
      area.parameters,
      token.access_token,
      'star',
    );
    return result;
  } else {
    console.log('Unsubscribing to repo webhook: ', area.parameters);
    await githubservice.unsubscribeToRepoWebhook(
      area.parameters,
      token.access_token,
      'star',
    );
    return 'Unsubscribed';
  }
}

async function action_dropbox_list_folder(
  area: any,
  prismaService: PrismaService,
  userinfo: UserInfos,
) {
  if (area.status == '0') {
    prismaService.area.update({
      where: { id: area.id },
      data: { last_state_token: null },
    });
    return;
  }

  const indentities = await userinfo.fetchUserInfosFromUserid(
    area.user_id,
    'dropbox',
  );

  let userid = null;
  if (indentities.length >= 2) {
    userid = indentities[0].user_id;
  } else {
    userid = indentities.user_id;
  }

  const dropboxService = new DropboxService(prismaService);

  const user_token = await dropboxService.getDropboxToken(userid);

  const lastest_cursor =
    await dropboxService.dropboxGetCursorListFolder(user_token);

  await prismaService.area.update({
    where: { id: area.id },
    data: { last_state_token: lastest_cursor },
  });
  console.log('Lastest cursor:', lastest_cursor);
}

async function action_microsoft_mail(
  area: any,
  prismaService: PrismaService,
  userinfo: UserInfos,
) {
  const indentity = await userinfo.fetchUserInfosFromUserid(
    area.user_id,
    'windowslive',
  );

  let tokens = await prismaService.token.findMany({
    where: {
      user_id: indentity.provider + '|' + indentity.user_id,
    },
  });

  const microsoftService = new MicrosoftService();

  //refresh token
  const newTokens = await microsoftService.refreshAccessToken(tokens[0].refresh_token);
  
  if (newTokens) {
    console.log('New tokens:', newTokens);
  
    const { accessToken, refreshToken } = newTokens;
  
    await prismaService.token.update({
      where: { id: tokens[0].id },
      data: { access_token: accessToken, refresh_token: refreshToken },
    });
  }
  if (area.status == '1') {

    tokens = await prismaService.token.findMany({
      where: {
        user_id: indentity.provider + '|' + indentity.user_id,
      },
    });

    const sub_id = await microsoftService.mailSubscription(
      tokens[0].access_token,
    );
    await prismaService.area.update({
      where: { id: area.id },
      data: { last_state_token: sub_id },
    });
  } else {
    await microsoftService.mailUnsubscription(
      tokens[0].access_token,
      area.last_state_token,
    );
    await prismaService.area.update({
      where: { id: area.id },
      data: { last_state_token: null },
    });
  }
  return 'Subscribed';
}

async function action_twitch(
  area: any,
  prismaService: PrismaService,
  userinfo: UserInfos,
) {
  console.log('Twitch action:', area);

  const identity = await userinfo.fetchUserInfosFromUserid(
    area.user_id,
    'oauth2',
  );

  let userid = identity.provider + '|' + identity.user_id;

  const twitchService = new TwitchService();

  const tokens = await prismaService.token.findMany({
    where: {
      user_id: userid,
    },
  });

  const access_token = await twitchService.refreshUserAccessToken(
    tokens[0].refresh_token,
  );

  await prismaService.token.update({
    where: { id: tokens[0].id },
    data: { access_token: access_token },
  });

  const params = JSON.parse(area.parameters);
  const params_json = JSON.parse(params);
  const username = params_json.username;

  if (area.status == '1') {
    const webhook_id = await twitchService.subscribeToWebhook(username);
    await prismaService.area.update({
      where: { id: area.id },
      data: { last_state_token: webhook_id },
    });
  } else {
    const subscriptionID = area.last_state_token;
    await twitchService.unsubscribeFromWebhook(subscriptionID);
    await prismaService.area.update({
      where: { id: area.id },
      data: { last_state_token: null },
    });
  }

  return 'Twitch action';
}

async function action_rss(
  area: any,
  prismaService: PrismaService,
  userinfo: UserInfos,
) {
  if (area.status == '0') {
    prismaService.area.update({
      where: { id: area.id },
      data: { last_state_token: null },
    });
    return;
  }
}
