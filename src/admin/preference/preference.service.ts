import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { PreferenceDto } from './preference.dto';

@Injectable()
export class PreferenceService {
  constructor(private prisma: PrismaService) {}

  async getConfigs() {
    const [data, total] = await Promise.all([
      this.prisma.preference.findMany({
        orderBy: [
          { category: 'asc' },
          { sort: 'asc' },
        ],
      }),
      this.prisma.preference.count(),
    ]);

    return {
      data,
      total,
    };
  }

  async createConfig(dto: PreferenceDto) {
    return this.prisma.preference.create({
      data: dto,
    });
  }

  async updateConfig(key: string, domain: string, value: string) {
    return this.prisma.preference.update({
      where: {
        key_domain: {
          key,
          domain,
        },
      },
      data: { value },
    });
  }

  async deleteConfig(key: string, domain: string) {
    return this.prisma.preference.delete({
      where: {
        key_domain: {
          key,
          domain,
        },
      },
    });
  }
} 