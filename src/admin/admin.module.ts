import { Module } from '@nestjs/common';
import { HomeModule } from './home/home.module';
import { PageModule } from './page/page.module';
import { AttachmentModule } from './attachment/attachment.module';
import { PreferenceModule } from './preference/preference.module';
import { AdminUserModule } from './user/user.module';
import { AdminActivityLogModule } from './activity-log/activity-log.module';
import { SystemLogModule } from './system-log/system-log.module';

@Module({
  imports: [
    HomeModule,
    PageModule,
    AttachmentModule,
    PreferenceModule,
    AdminUserModule,
    AdminActivityLogModule,
    SystemLogModule,
  ],
})
export class AdminModule {}
