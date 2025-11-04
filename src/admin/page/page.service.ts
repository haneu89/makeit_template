import { Injectable } from '@nestjs/common';
import { PageDto } from './page.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PageService {
  constructor(private prisma: PrismaService) {}

  async getPages() {
    const [data, total] = await Promise.all([
      this.prisma.page.findMany({
        orderBy: [
          { domain: 'asc' },
          { route: 'asc' }
        ],
      }),
      this.prisma.page.count(),
    ]);

    return {
      data,
      total,
    };
  }

  async createPage(createPageDto: PageDto) {
    return this.prisma.page.create({
      data: {
        route: createPageDto.route,
        domain: createPageDto.domain,
        title: createPageDto.title,
        content: createPageDto.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getPageByRouteAndDomain(route: string, domain: string) {
    return this.prisma.page.findUnique({
      where: {
        route_domain: {
          route,
          domain,
        },
      },
    });
  }

  async updatePage(route: string, domain: string, updatePageDto: PageDto) {
    return this.prisma.page.update({
      where: {
        route_domain: {
          route,
          domain,
        },
      },
      data: {
        title: updatePageDto.title,
        content: updatePageDto.content,
        updatedAt: new Date(),
      },
    });
  }

  async deletePage(route: string, domain: string) {
    await this.prisma.page.delete({
      where: {
        route_domain: {
          route,
          domain,
        },
      },
    });
    return { message: 'Page deleted successfully' };
  }
} 