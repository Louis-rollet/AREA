import { Delete, Post, Param, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AreaService } from './area.service';
import { Controller, Get } from '@nestjs/common';
import { CheckAuthGuard as AuthGuard2 } from '../auth/auth.guard';
import { UserInfos } from 'src/auth/auth.service';
import { ServiceService } from 'src/service/service.service';
import { ActionService } from './action/action.service';
import { ReactionService } from './reaction/reaction.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiBearerAuth()
@ApiTags('area')
@Controller('action-reaction')
export class AreaController {
  intervalId: NodeJS.Timeout;
  constructor(
    private readonly areaService: AreaService,
    private readonly serviceService: ServiceService,
    private readonly userinfo: UserInfos,
    private readonly actionService: ActionService,
    private readonly reactionService: ReactionService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('Area')
  @ApiOperation({
    summary: 'Getting all area available of the connected user',
  })
  @ApiResponse({ status: 200, description: 'Return a list of area' })
  @UseGuards(AuthGuard2)
  async getAreaAction(@Req() req, @Res() res) {
    const users_ids = await this.userinfo.fetchAllUserId(req.auth.sub);
    console.log('All users ids:', users_ids);
  
    users_ids.map(async (user_id) => {
      this.prisma.area.updateMany({
        where: {
          user_id: user_id,
        },
        data: {
          user_id: req.auth.sub,
        },
      });
    });

    const area = await this.areaService.getAreaAction(req.auth.sub);

    console.log('All areas:', area);

    res.send(area);
  }

  @Get('Area/Reaction')
  @ApiOperation({
    summary: 'Getting all reactions activate for the connected user',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return a list of reactions with area id where the reaction is',
  })
  @UseGuards(AuthGuard2)
  async getAreaReaction(@Req() req, @Res() res) {
    // Implement your logic here
    res.send(await this.areaService.getAreaReaction(req.auth.sub));
  }

  @Post('Area')
  @ApiOperation({
    summary: 'Create a new area',
  })
  @ApiResponse({ status: 200, description: 'The area created' })
  @UseGuards(AuthGuard2)
  async postArea(@Req() req, @Res() res) {
    if (req.auth.sub.includes('|')) {
      const id_action = req.body.id_action;
      const ids_reaction = req.body.ids_reaction;
      const name = req.body.name;
      const parameters = req.body.parameters;
      const description = req.body.description;

      console.log('id_action:', id_action);
      console.log('ids_reaction:', ids_reaction);
      console.log('name:', name);
      console.log('parameters:', parameters);
      console.log('description:', description);

      const ids = ids_reaction.map((reaction) => reaction.id);
      console.log('ids:', ids);
      const reaction_parameters = ids_reaction.map(
        (reaction) => reaction.parameters,
      );
      console.log('reaction_parameters:', reaction_parameters);

      if (!Array.isArray(ids_reaction)) {
        return res.status(400).send('ids_reaction must be an array');
      }

      const user_id = req.auth.sub;

      try {
        const result = await this.areaService.postArea(
          id_action,
          ids,
          reaction_parameters,
          user_id,
          name,
          parameters,
          description,
        );

        await this.areaService.launchFunctionForArea(
          result.areaId,
          this.userinfo,
        );

        return res.send(result);
      } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
      }
    }

    return res.status(403).send('Forbidden');
  }

  @Put('Area/:id')
  @ApiOperation({
    summary: 'Editing an area by is id',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @UseGuards(AuthGuard2)
  async putArea(@Req() req, @Res() res) {
    const id = Number(req.params.id);
    const status = req.body.status;
    const user_id = req.auth.sub;

    try {
      const result = await this.areaService.putArea(id, status, user_id);
      console.log(result);
      await this.areaService.launchFunctionForArea(id, this.userinfo);
      return res.send('Success');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  @Delete('Area/:id')
  @ApiOperation({
    summary: 'Deleting an area by is id',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @UseGuards(AuthGuard2)
  async deleteArea(@Req() req, @Res() res) {
    const id = Number(req.params.id);
    const user_id = req.auth.sub;

    try {
      await this.areaService.putArea(id, 0, user_id);
      await this.areaService.launchFunctionForArea(id, this.userinfo);
      await this.areaService.deleteArea(id, user_id);
      return res.send('Success');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  @Get('Service')
  @ApiOperation({
    summary: 'Getting all services available of the connected user',
  })
  @ApiResponse({ status: 200, description: 'Return a list of actions' })
  @UseGuards(AuthGuard2)
  async getService(@Req() req: any, @Res() res: any) {
    const userinfo = new UserInfos();
    console.log('req.auth.sub:', req.auth.sub);
    const service = await this.serviceService.getUser(req.auth.sub, userinfo);
    const filteredService = service.filter((s) => s.name !== 'rss');
    res.send(filteredService);
  }
}
