import { Module } from '@nestjs/common';
import { AdminActivityLogController } from './activity-log.controller';
import { ActivityLogModule } from '../../shared/activity-log/activity-log.module';

@Module({
  imports: [ActivityLogModule],
  controllers: [AdminActivityLogController],
})
export class AdminActivityLogModule {}
