import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { CustomMulterModule } from '../shared/multer/multer.module';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { JwtRoleModule } from '../shared/jwt';

@Module({
  imports: [CustomMulterModule, PrismaModule, JwtRoleModule],
  controllers: [AttachmentController],
  providers: [AttachmentService],
})
export class AttachmentModule {}
