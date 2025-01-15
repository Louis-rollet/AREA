import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { UserInfos } from 'src/auth/auth.service';
import { CheckAuthGuard as AuthGuard2 } from 'src/auth/auth.guard';
import { ActionService } from './action.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Action')
@Controller('action-reaction')
export class ActionController {
  constructor(
    private readonly userinfo: UserInfos,
    private readonly actionService: ActionService,
  ) {}

  @Get('Action')
  @ApiOperation({
    summary: 'Getting all actions available of the connected user',
  })
  @ApiResponse({ status: 200, description: 'Return a list of actions' })
  @UseGuards(AuthGuard2)
  async getByUser(@Req() req: any, @Res() res: any) {
    const services = await this.userinfo.fetchUserService(req.auth.sub);

    services.push('rss');

    const actions = await this.actionService.getByService(services);

    const all_services = await this.actionService.getAllServices();

    const actionsWithIcons = actions.map(action => {
      const service = all_services.find(service => service.id === action.service_id);
      return {
        ...action,
        icon: service ? service.icon : null,
      };
    });

    res.send(actionsWithIcons);
  }

  @Get('Action/:id')
  @ApiOperation({ summary: 'Get action by id' })
  @ApiResponse({ status: 200, description: 'Return an action' })
  getById(@Param('id') id: string) {
    const nbId = Number(id);
    if (isNaN(nbId)) {
      return 'Invalid id';
    }

    return this.actionService.getById(Number(id));
  }
}
