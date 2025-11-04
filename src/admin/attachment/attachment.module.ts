import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { CustomMulterModule } from '../../shared/multer/multer.module';

@Module({
  imports: [CustomMulterModule, PrismaModule],
  controllers: [AttachmentController],
  providers: [AttachmentService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
