import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CheckAuthGuard } from './auth/auth.guard';
import { ServiceService } from './service/service.service';
import { ActionService } from './area/action/action.service';
import { ReactionService } from './area/reaction/reaction.service';

@ApiTags('Example')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly serviceService: ServiceService,
    private readonly actionService: ActionService,
    private readonly reactionService: ReactionService,
  ) {}

  @Get('about.json')
  @ApiOperation({ summary: 'Get About' })
  @ApiResponse({ status: 200, description: 'Return about' })
  async getAbout(@Req() req: any): Promise<any> {
    const services = await this.serviceService.getAll();
    const names = services.map((service) => service.name);
    const serviceNames = services.map((service) => service.display_name);
    const serverServices = [];
    for (const service of names) {
      const serviceActions = await this.actionService.getByService([service]);
      const serviceReactions = await this.reactionService.getByService([
        service,
      ]);
      const serviceDef = {
        name: serviceNames[names.indexOf(service)],
        actions: serviceActions.map((action) => ({
          name: action.name,
          description: action.description,
        })),
        reactions: serviceReactions.map((reaction) => ({
          name: reaction.name,
          description: reaction.description,
        })),
      };
      serverServices.push(serviceDef);
    }
    const client = {
      host: req.ip,
    };
    const server = {
      current_time: this.appService.getTime(),
      services: serverServices,
    };
    const about = {
      client,
      server,
    };
    return about;
  }
}
