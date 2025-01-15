import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ActionService {
  constructor(private prisma: PrismaService) {}

  async getByService(services: any) {
    const all_action = await this.prisma.action.findMany();

    const all_services = await this.prisma.service.findMany();

    const all_services_ids = all_services
      .filter((service) => services.includes(service.name))
      .map((service) => service.id);

    const result = all_action.filter((action) => {
      return all_services_ids.includes(action.service_id);
    });

    return result;
  }

  async getAllServices() {
    return this.prisma.service.findMany();
  }

  async getById(id: number) {
    return this.prisma.action.findUnique({
      where: {
        id: id,
      },
    });
  }
}
