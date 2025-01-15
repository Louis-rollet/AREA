/* eslint-disable prettier/prettier */
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleService } from 'src/service/google/google.service';
import { GithubService } from 'src/service/github/github.service';
import { TokenService } from '../token/token.service';
import { TwitchService } from 'src/service/twitch/twitch.service';
import { DropboxService } from 'src/service/dropbox/dropbox.service';
import { MicrosoftService } from 'src/service/microsoft/microsoft.service';

export const reactionHandlers: {
  [key: number]: (
    action_res: any,
    user_id: string,
    area_id: number,
    prisma: PrismaService,
  ) => Promise<any>;
} = {
  1: google_send_email,
  2: action_github_issue,
  3: twitch_send_message,
  4: dropbox_move,
  5: dropbox_delete,
  6: outlook_add_event,
  7: create_tasks_google,
  8: calendar_add_event,
};

export async function parseActionRes(action_res, passable_data, reactions_parameters) {
  let reactionParamsObj = JSON.parse(reactions_parameters);
  reactionParamsObj=JSON.parse(reactionParamsObj);

  console.log('reactionParamsObj:', reactionParamsObj);

  passable_data=JSON.parse(passable_data);
  console.log('passable_data1:', passable_data);

  for (const [key, value] of Object.entries(reactionParamsObj)) {
    const matches = (value as string).match(/\$\{action\.(\w+)\}/g); // ${action.<field>}

    console.log('matches:', matches);
    
    if (matches) {
      matches.forEach((match) => {
        const fieldName = match.match(/\$\{action\.(\w+)\}/)[1];

        console.log('fieldName:', fieldName);
        
        const parsableEntry = passable_data.find((item) => item.accessible_as === `$\{action.${fieldName}\}`);

        console.log('parsableEntry:', parsableEntry);
        if (parsableEntry && action_res[fieldName] !== undefined) {
          let replacementValue = action_res[fieldName];

          console.log('replacementValue:', replacementValue);

          if (typeof replacementValue === 'object' && replacementValue !== null) {
            replacementValue = replacementValue.emailAddress?.address || replacementValue.address || JSON.stringify(replacementValue);
          }
          console.log('replacementValue:', replacementValue);
          reactionParamsObj[key] = reactionParamsObj[key].replace(match, replacementValue);
        }
      });
    }
  }
  return reactionParamsObj;
}

async function google_send_email(action_res, user_id, area_id, prismaService)
{
  const tokens = await prismaService.token.findMany({
    where: {
      user_id: user_id,
    },
  });
  const token = tokens as any[];
  if (token.length === 0) {
    throw new Error('User not found');
  }

  const googleService = new GoogleService(new ConfigService());

  const access_token = await googleService.refreshAccessToken(
    token[0].refresh_token,
  );

  const tokenService = new TokenService(prismaService);

  await tokenService.putTokens(user_id, access_token);

  const areaReaction = await prismaService.area_reaction.findFirst({
    where: {
      area_id: area_id,
      reaction_id: 1,
    },
    select: {
      parameters: true,
    },
  });

  if (!areaReaction || !areaReaction.parameters) {
    throw new Error('Parameters not found');
  }

  const area = await prismaService.area.findFirst({
    where: {
      id: area_id,
    }});

    const action = await prismaService.action.findFirst({
      where: {
        id: area.action_id,
      },
    });


  let parameters = await parseActionRes(action_res, action.passable_data, areaReaction.parameters);

  console.log('parameters to:', parameters.to);
  console.log('parameters subject:', parameters.subject);
  console.log('parameters body:', parameters.body);

  if (
    parameters &&
    parameters.to !== undefined &&
    parameters.subject !== undefined &&
    parameters.body !== undefined
  ) {
    await googleService.sendEmail(
      parameters.to,
      parameters.cc,
      parameters.bcc,
      parameters.subject,
      parameters.body,
    );
  }
}

async function action_github_issue(action_res, user_id, area_id, prismaService) {
  const tokens = await prismaService.token.findMany({
    where: {
      user_id: user_id,
    },
  });

  if (tokens.length === 0) {
    throw new Error('User not found');
  }

  const token = tokens[0];

  const areaReaction = await prismaService.area_reaction.findFirst({
    where: {
      area_id: area_id,
      reaction_id: 2,
    },
    select: {
      parameters: true,
    },
  });

  if (!areaReaction || !areaReaction.parameters) {
    throw new Error('Parameters not found');
  }

  const area = await prismaService.area.findFirst({
    where: {
      id: area_id,
    }});

    const action = await prismaService.action.findFirst({
      where: {
        id: area.action_id,
      },
    });


  let parameters = await parseActionRes(action_res, action.passable_data, areaReaction.parameters);
  if (
    parameters &&
    parameters.owner !== undefined &&
    parameters.repo !== undefined &&
    parameters.title !== undefined &&
    parameters.body !== undefined
  ) {
    const githubService = new GithubService();
    await githubService.issueOnRepo(
      token.access_token,
      parameters.owner,
      parameters.repo,
      parameters.title,
      parameters.body,
    );
  }
}

async function twitch_send_message(action_res, user_id, area_id, prismaService) {
  const tokens = await prismaService.token.findMany({
    where: {
      user_id: user_id,
    },
  });

  if (tokens.length === 0) {
    throw new Error('User not found');
  }

  const token = tokens[0];

  const twitchService = new TwitchService();

  const access_token = await twitchService.refreshUserAccessToken(token.refresh_token);

  await prismaService.token.update({
    where: {
      id: token.id,
    },
    data: {
      access_token: access_token,
    },
  });

  const areaReaction = await prismaService.area_reaction.findFirst({
    where: {
      area_id: area_id,
      reaction_id: 3,
    },
    select: {
      parameters: true,
    },
  });

  if (!areaReaction || !areaReaction.parameters) {
    throw new Error('Parameters not found');
  }

  const area = await prismaService.area.findFirst({
    where: {
      id: area_id,
    }});

    const action = await prismaService.action.findFirst({
      where: {
        id: area.action_id,
      },
    });


  let parameters = await parseActionRes(action_res, action.passable_data, areaReaction.parameters);

  if (
    parameters &&
    parameters.username !== undefined &&
    parameters.message !== undefined
  ) {
    await twitchService.sendMessageToChannel(
      token.access_token,
      parameters.username,
      parameters.message,
      user_id.split('|')[2],
    );
  }
}

async function dropbox_move(action_res, user_id, area_id, prismaService) {
  const tokens = await prismaService.token.findMany({
    where: {
      user_id: user_id,
    },
  });

  if (tokens.length === 0) {
    throw new Error('User not found');
  }

  const token = tokens[0];

  const areaReaction = await prismaService.area_reaction.findFirst({
    where: {
      area_id: area_id,
      reaction_id: 4,
    },
    select: {
      parameters: true,
    },
  });

  if (!areaReaction || !areaReaction.parameters) {
    throw new Error('Parameters not found');
  }

  const area = await prismaService.area.findFirst({
    where: {
      id: area_id,
    }});

    const action = await prismaService.action.findFirst({
      where: {
        id: area.action_id,
      },
    });


  let parameters = await parseActionRes(action_res, action.passable_data, areaReaction.parameters);

  if (
    parameters &&
    parameters.from !== undefined &&
    parameters.to !== undefined
  ) {
    const dropboxService = new DropboxService(prismaService);
    await dropboxService.dropboxMove(
      token.access_token,
      parameters.from,
      parameters.to,
    );
  }
}

async function dropbox_delete(action_res, user_id, area_id, prismaService) {
  const tokens = await prismaService.token.findMany({
    where: {
      user_id: user_id,
    },
  });

  if (tokens.length === 0) {
    throw new Error('User not found');
  }

  const token = tokens[0];

  const areaReaction = await prismaService.area_reaction.findFirst({
    where: {
      area_id: area_id,
      reaction_id: 5,
    },
    select: {
      parameters: true,
    },
  });

  if (!areaReaction || !areaReaction.parameters) {
    throw new Error('Parameters not found');
  }

  const area = await prismaService.area.findFirst({
    where: {
      id: area_id,
    }});

    const action = await prismaService.action.findFirst({
      where: {
        id: area.action_id,
      },
    });


  let parameters = await parseActionRes(action_res, action.passable_data, areaReaction.parameters);

  if (parameters && parameters.path !== undefined) {
    const dropboxService = new DropboxService(prismaService);
    await dropboxService.dropboxDelete(token.access_token, parameters.path);
  }
}

async function outlook_add_event(action_res, user_id, area_id, prismaService) {
  const tokens = await prismaService.token.findMany({
    where: {
      user_id: user_id,
    },
  });

  if (tokens.length === 0) {
    throw new Error('User not found');
  }

  const token = tokens[0];

  const areaReaction = await prismaService.area_reaction.findFirst({
    where: {
      area_id: area_id,
      reaction_id: 6,
    },
    select: {
      parameters: true,
    },
  });

  if (!areaReaction || !areaReaction.parameters) {
    throw new Error('Parameters not found');
  }

  const area = await prismaService.area.findFirst({
    where: {
      id: area_id,
    }});

    const action = await prismaService.action.findFirst({
      where: {
        id: area.action_id,
      },
    });


  let parameters_json = await parseActionRes(action_res, action.passable_data, areaReaction.parameters);

  console.log('parameters:', parameters_json);

  if (parameters_json && parameters_json.subject !== undefined) {
    const outlookService = new MicrosoftService();
  
    const event = {
      subject: parameters_json.subject || "Default Subject",
      body: {
        contentType: "HTML",
        content: parameters_json.body || "Default Body"
      },
      start: {
        dateTime: parameters_json.startDateTime || "2024-11-01T12:00:00",
        timeZone: parameters_json.timeZone || "Pacific Standard Time"
      },
      end: {
        dateTime: parameters_json.endDateTime || "2024-11-01T14:00:00",
        timeZone: parameters_json.timeZone || "Pacific Standard Time"
      },
      location: {
        displayName: parameters_json.location || "Default Location"
      },
      attendees: parameters_json.attendees || [],
      allowNewTimeProposals: true,
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness"
    };
  
    await outlookService.addEventToCalendar(token.access_token, event);
  }
}

async function create_tasks_google(action_res, user_id, area_id, prismaService) {
  const tokens = await prismaService.token.findMany({
    where: {
      user_id: user_id,
    },
  });

  if (tokens.length === 0) {
    throw new Error('User not found');
  }

  const token = tokens[0];

  const areaReaction = await prismaService.area_reaction.findFirst({
    where: {
      area_id: area_id,
      reaction_id: 7,
    },
    select: {
      parameters: true,
    },
  });

  if (!areaReaction || !areaReaction.parameters) {
    throw new Error('Parameters not found');
  }

  const area = await prismaService.area.findFirst({
    where: {
      id: area_id,
    }});

    const action = await prismaService.action.findFirst({
      where: {
        id: area.action_id,
      },
    });


  let parameters_json = await parseActionRes(action_res, action.passable_data, areaReaction.parameters);

  if (parameters_json && parameters_json.title !== undefined) {
    const googleService = new GoogleService(new ConfigService());
    const access_token = await googleService.refreshAccessToken(token.refresh_token);
    googleService.setAccessToken(access_token);
    const task =
    {
      title: parameters_json.title,
      notes: parameters_json.notes,
      dueDate: parameters_json.dueDate,
    }
    await googleService.createTask(
      task
    );
  }
}

async function calendar_add_event(action_res, user_id, area_id, prismaService) {
  const tokens = await prismaService.token.findMany({
    where: {
      user_id: user_id,
    },
  });

  if (tokens.length === 0) {
    throw new Error('User not found');
  }

  const token = tokens[0];

  const areaReaction = await prismaService.area_reaction.findFirst({
    where: {
      area_id: area_id,
      reaction_id: 8,
    },
    select: {
      parameters: true,
    },
  });

  if (!areaReaction || !areaReaction.parameters) {
    throw new Error('Parameters not found');
  }

  const area = await prismaService.area.findFirst({
    where: {
      id: area_id,
    }});

    const action = await prismaService.action.findFirst({
      where: {
        id: area.action_id,
      },
    });


  let parameters_json = await parseActionRes(action_res, action.passable_data, areaReaction.parameters);

  if (parameters_json) {
    const googleService = new GoogleService(new ConfigService());
    const access_token = await googleService.refreshAccessToken(token.refresh_token);
    googleService.setAccessToken(access_token);
  
    const event = {
      summary: parameters_json.subject || "Default Subject",
      description: parameters_json.body || "Default Body",
      start: {
        dateTime: parameters_json.startDateTime || "2024-11-01T12:00:00",
        timeZone: parameters_json.timeZone || "America/Los_Angeles"
      },
      end: {
        dateTime: parameters_json.endDateTime || "2024-11-10T14:00:00",
        timeZone: parameters_json.timeZone || "America/Los_Angeles"
      },
      attendees: parameters_json.attendees || [],
    };
  
    try {
      await googleService.createEvent(event);
      console.log('Event created successfully');
    } catch (error) {
      console.error('Error creating event:', error.response ? error.response.data : error.message);
    }
  }
}