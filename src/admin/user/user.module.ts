import { Module } from '@nestjs/common';
import { AdminUserController } from './user.controller';
import { AdminUserService } from './user.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { ActivityLogModule } from '../../shared/activity-log/activity-log.module';

@Module({
  imports: [PrismaModule, ActivityLogModule],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
