import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PageService } from './page.service';
import { PageDto } from './page.dto';
import { Role, Roles } from '../../shared/jwt';

@Controller('admin/page')
@Roles(Role.ADMIN)
export class PageController {
  constructor(private readonly service: PageService) {}

  @Get()
  async index() {
    const data = await this.service.getPages();
    return data;
  }

  @Post()
  async create(@Body() createPageDto: PageDto) {
    const newPage = await this.service.createPage(createPageDto);
    return newPage;
  }

  @Get(':route')
  async show(
    @Param('route') route: string,
    @Query('domain') domain: string = 'default',
  ) {
    const item = await this.service.getPageByRouteAndDomain(route, domain);
    return item;
  }

  @Put(':route')
  async update(
    @Param('route') route: string,
    @Query('domain') domain: string = 'default',
    @Body() updatePageDto: PageDto
  ) {
    const updatedPage = await this.service.updatePage(route, domain, updatePageDto);
    return updatedPage;
  }

  @Delete(':route')
  async destroy(
    @Param('route') route: string,
    @Query('domain') domain: string = 'default',
  ) {
    await this.service.deletePage(route, domain);
    return { message: 'Page deleted successfully' };
  }
} 