import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PreferenceService } from './preference.service';
import { PreferenceDto } from './preference.dto';
import { Role, Roles } from '../../shared/jwt';

@Controller('admin/preference')
@Roles(Role.ADMIN)
export class PreferenceController {
  constructor(private readonly service: PreferenceService) {}

  @Get()
  async index() {
    const data = await this.service.getConfigs();
    return data;
  }

  @Post()
  async create(@Body() dto: PreferenceDto) {
    return this.service.createConfig(dto);
  }

  @Put(':key')
  async update(
    @Param('key') key: string,
    @Query('domain') domain: string = 'default',
    @Body('value') value: string,
  ) {
    const updatedConfig = await this.service.updateConfig(key, domain, value);
    return updatedConfig;
  }

  @Delete(':key')
  async delete(
    @Param('key') key: string,
    @Query('domain') domain: string = 'default',
  ) {
    return this.service.deleteConfig(key, domain);
  }
} 