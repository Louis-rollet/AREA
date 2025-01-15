import { Injectable } from '@nestjs/common';
import { UserInfos } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.service.findMany();
  }

  async getUser(user_id: string, userinfo: UserInfos) {
    const services = await this.prisma.service.findMany();

    const userServices = await userinfo.fetchUserService(user_id);
    console.log('services:', userServices);

    const servicesSet = new Set(userServices);

    const mainservice = await userinfo.fetchMainUserProvider(user_id);

    const emails = await userinfo.fetchEmails(user_id);

    const updatedServices = services.map((service) => {
      const emailIndex = services.findIndex(s => s.id === service.id);
      return {
      ...service,
      display_name: service.display_name,
      icon: service.icon,
      email: emailIndex !== -1 ? emails[emailIndex] : null,
      connected: servicesSet.has(service.name) ? 1 : 0,
      unlinkable: service.name === mainservice ? false : true,
      };
    });

    return updatedServices;
  }
}
