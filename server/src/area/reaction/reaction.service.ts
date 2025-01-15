import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReactionService {
  constructor(private prisma: PrismaService) {}

  async getByService(services: any) {
    const all_reaction = await this.prisma.reaction.findMany();

    const all_services = await this.prisma.service.findMany();

    const all_services_ids = all_services
      .filter((service) => services.includes(service.name))
      .map((service) => service.id);

    const result = all_reaction.filter((reaction) => {
      return all_services_ids.includes(reaction.service_id);
    });

    return result;
  }

  async getAllServices() {
    return this.prisma.service.findMany();
  }

  async getById(id: number) {
    return this.prisma.reaction.findUnique({
      where: {
        id: id,
      },
    });
  }
}
