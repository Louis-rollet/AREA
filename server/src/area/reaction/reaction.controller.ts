import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { UserInfos } from 'src/auth/auth.service';
import { CheckAuthGuard as AuthGuard2 } from 'src/auth/auth.guard';
import { ReactionService } from './reaction.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Reaction')
@Controller('action-reaction')
export class ReactionController {
  constructor(
    private readonly userinfo: UserInfos,
    private readonly reactionService: ReactionService,
  ) {}

  @Get('Reaction')
  @ApiOperation({
    summary: 'Getting all reactions available of the connected user',
  })
  @ApiResponse({ status: 200, description: 'Return a list of reactions' })
  @UseGuards(AuthGuard2)
  async getByUser(@Req() req, @Res() res) {
    const services = await this.userinfo.fetchUserService(req.auth.sub);

    const reactions = await this.reactionService.getByService(services);

    const all_services = await this.reactionService.getAllServices();

    const reactionsWithIcons = reactions.map(reaction => {
      const service = all_services.find(service => service.id === reaction.service_id);
      return {
        ...reaction,
        icon: service ? service.icon : null,
      };
    });

    res.send(reactionsWithIcons);
  }

  @Get('Reaction/:id')
  @ApiOperation({
    summary: 'Getting an action by id',
  })
  @ApiResponse({ status: 200, description: 'Return a reaction' })
  getById(@Param('id') id: string) {
    const nbId = Number(id);
    if (isNaN(nbId)) {
      return 'Invalid id';
    }
    return this.reactionService.getById(Number(id));
  }
}
