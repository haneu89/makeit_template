import { Module } from '@nestjs/common';
import { SystemLogController } from './system-log.controller';
import { SystemLogService } from './system-log.service';

@Module({
  controllers: [SystemLogController],
  providers: [SystemLogService],
})
export class SystemLogModule {}
