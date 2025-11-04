import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../shared/jwt/jwt-role.guard';
import { Role } from '../../shared/jwt/roles.enum';
import { HomeService } from './home.service';

@Controller('admin')
@Roles(Role.ADMIN, Role.MANAGER) // ADMIN, MANAGER 모두 접근 가능
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.homeService.getDashboardStats();
  }
}
