import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UserInfos } from '../auth/auth.service';
import { actionHandlers } from './action/action.handler';
import { reactionHandlers } from './reaction/reaction.handler';

@Injectable()
export class AreaService {
  intervalId: NodeJS.Timeout;
  constructor(private prisma: PrismaService) {}

  checkEmailContent(email: any, area: any) {
    let json = area.parameters;
    json = JSON.parse(json);
    json = JSON.parse(json);
    if (json) {
      if (json.subject && json.subject != '' && email.subject != json.subject) {
        return false;
      }
      if (json.body && json.body != '' && email.body != json.body) {
        return false;
      }
      if (json.from && json.from != '' && !email.from.includes(json.from)) {
        return false;
      }
      if (json.to && json.to != '' && !email.to.includes(json.to)) {
        return false;
      }
      if (json.cc && json.cc != '' && email.cc != json.cc) {
        return false;
      }
      if (json.bcc && json.bcc != '' && email.bcc != json.bcc) {
        return false;
      }
    }
    return true;
  }

  async launchFunctionForArea(area_id: number, userinfo: UserInfos) {
    const area = await this.prisma.area.findUnique({
      where: {
        id: area_id,
      },
    });

    if (!area) {
      throw new Error('Area not found');
    }

    const action = await this.prisma.action.findUnique({
      where: {
        id: area.action_id,
      },
    });

    if (!action) {
      throw new Error('Action not found');
    }

    const action_service = await this.prisma.service.findUnique({
      where: {
        id: action.service_id,
      },
    });

    if (!action_service) {
      throw new Error('Service not found');
    }
    let res = '';
    console.log('areaData:', area);
    if (area.action_id in actionHandlers) {
      res = await actionHandlers[area.action_id](area, this.prisma, userinfo);
      console.log('res:', res);
    }
  }

  async launchReactionFunctionForArea(
    area_reactions: any,
    action_res: any,
    user_id: string,
    userinfo: UserInfos,
  ) {
    for (const area_reaction of area_reactions as any[]) {

        const reaction = await this.prisma.reaction.findUnique({
          where: {
            id: area_reaction.reaction_id,
          },
        });

        const service = await this.prisma.service.findUnique({
          where: {
            id: reaction?.service_id,
          },
        });

        const identitie = await userinfo.fetchUserInfosFromUserid(user_id, service.name);

        const user = identitie.provider + "|" + identitie.user_id;

        await reactionHandlers[area_reaction.reaction_id](
          action_res,
          user,
          area_reaction.area_id,
          this.prisma,
        );
      }
    }

  async getAreaAction(user_id: string) {
    const area = await this.prisma.area.findMany({
      where: {
        user_id: user_id,
      },
    });
    return { area };
  }

  async getAreaReaction(user_id: string) {
    const area = await this.prisma.area.findMany({
      where: {
        user_id: user_id,
      },
    });
    if (area.length === 0) {
      return {};
    }
    const area_reactions = await this.prisma.area_reaction.findMany({
      where: {
        area_id: {
          in: area.map((a) => a.id),
        },
      },
    });
    return { area_reactions };
  }

  async postArea(
    id_action: number,
    ids_reaction: number[],
    reactions_parameters: any[],
    user_id: string,
    name: string,
    parameters: any,
    description: string,
  ) {
    const action = await this.prisma.action.findUnique({
      where: { id: id_action },
    });
    if (!action) {
      throw new Error('Action not found');
    }

    ids_reaction = ids_reaction.filter(id => id !== null && id !== undefined);

    const reactions = await this.prisma.reaction.findMany({
      where: { id: { in: ids_reaction } },
    });
    if (reactions.length !== ids_reaction.length) {
      throw new Error('Reaction not found');
    }

    // const existingArea = await this.prisma.area.findFirst({
    //   where: { action_id: id_action, user_id: user_id },
    // });
    // if (existingArea) {
    //   const existingAreaReactions = await this.prisma.area_reaction.findMany({
    //     where: { reaction_id: { in: ids_reaction }, area_id: existingArea.id },
    //   });
    //   if (existingAreaReactions.length !== 0) {
    //     throw new Error('Area already exists');
    //   }
    // }
    const newArea = await this.prisma.area.create({
      data: {
        action_id: id_action,
        user_id: user_id,
        status: true,
        name: name,
        parameters: JSON.stringify(parameters),
        description: description,
      },
    });

    for (const reactionId of ids_reaction) {
      await this.prisma.area_reaction.create({
        data: {
          area_id: newArea.id,
          reaction_id: reactionId,
          parameters: JSON.stringify(
            reactions_parameters[ids_reaction.indexOf(reactionId)],
          ),
        },
      });
    }

    return { areaId: newArea.id, reactions: ids_reaction };
  }

  async putArea(id: number, status: number, user_id: string) {
    const area = await this.prisma.area.findFirst({
      where: {
        id: id,
        user_id: user_id,
      },
    });

    if (!area) {
      throw new Error('Area not found');
    }

    if (area.user_id !== user_id) {
      throw new Error('Forbidden');
    }

    const updatedArea = await this.prisma.area.update({
      where: {
        id: id,
      },
      data: {
        status: status == 1,
      },
    });

    return { id: updatedArea.id, status: updatedArea.status };
  }

  async deleteArea(id: number, user_id: string) {
    const area = await this.prisma.area.findFirst({
      where: {
        id: id,
        user_id: user_id,
      },
    });

    if (!area) {
      throw new Error('Area not found');
    }

    if (area.user_id !== user_id) {
      throw new Error('Forbidden');
    }

    await this.prisma.area_reaction.deleteMany({
      where: {
        area_id: id,
      },
    });

    await this.prisma.area.delete({
      where: {
        id: id,
      },
    });

    return { id };
  }
}
