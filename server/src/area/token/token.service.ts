import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokenService {
  constructor(private prisma: PrismaService) {}

  async getTokens() {
    return this.prisma.token.findMany();
  }

  async getTokensById(id: number) {
    return this.prisma.token.findUnique({
      where: {
        id: id,
      },
    });
  }

  async getTokensByUserId(user_id: string) {
    return this.prisma.token.findMany({
      where: {
        user_id: user_id,
      },
    });
  }

  async postTokens(
    user_id: string,
    access_token: string,
    refresh_token: string,
  ) {
    const existingTokens = await this.prisma.token.findMany({
      where: {
        user_id: user_id,
      },
    });

    if (existingTokens.length !== 0) {
      console.log('User already exists');
      await this.putRefreshTokens(user_id, refresh_token);
      await this.putTokens(user_id, access_token);
      return existingTokens;
    }

    const newToken = await this.prisma.token.create({
      data: {
        user_id: user_id,
        access_token: access_token,
        refresh_token: refresh_token,
      },
    });
    return newToken;
  }

  async postTokensAccess(user_id: string, access_token: string) {
    const existingTokens = await this.prisma.token.findMany({
      where: {
        user_id: user_id,
      },
    });

    if (existingTokens.length !== 0) {
      console.log('User already exists');
      await this.putTokens(user_id, access_token);
      return existingTokens;
    }

    const newToken = await this.prisma.token.create({
      data: {
        user_id: user_id,
        access_token: access_token,
      },
    });
    return newToken;
  }

  async putTokens(user_id: string, access_token: string) {
    const updatedToken = await this.prisma.token.updateMany({
      where: {
        user_id: user_id,
      },
      data: {
        access_token: access_token,
      },
    });
    return updatedToken;
  }

  async putRefreshTokens(user_id: string, refresh_token: string) {
    const updatedToken = await this.prisma.token.updateMany({
      where: {
        user_id: user_id,
      },
      data: {
        refresh_token: refresh_token,
      },
    });
    return updatedToken;
  }

  async deleteTokens(user_id: string) {
    const deletedTokens = await this.prisma.token.deleteMany({
      where: {
        user_id: user_id,
      },
    });
    return deletedTokens;
  }

  async putlast_state_token(area_id: number, last_state: string) {
    const updatedArea = await this.prisma.area.update({
      where: {
        id: area_id,
      },
      data: {
        last_state_token: last_state,
      },
    });
    return updatedArea;
  }
}
