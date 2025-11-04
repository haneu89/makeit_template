import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { Response } from 'express';
import { FileService } from '../shared/multer/file.service';

@Injectable()
export class AttachmentService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  async saveAttachment(file: Express.Multer.File, protocol: string, host: string) {
    const { savedName, realPath } = await this.fileService.saveFile(file);

    const attachment = await this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        savedName,
        realPath,
        fileSize: file.size,
        mime: file.mimetype,
        storage: 'local',
      },
    });

    return attachment;
  }

  async findBySavedName(savedName: string, userRole: 'ADMIN' | 'MANAGER' | 'USER' = 'USER') {
    const attachment = await this.prisma.attachment.findFirst({
      where: { savedName },
    });

    if (!attachment) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    // 권한 체크
    if (attachment.viewRole) {
      if (attachment.viewRole === 'ADMIN' && userRole !== 'ADMIN') {
        throw new ForbiddenException('이 파일을 볼 권한이 없습니다.');
      }
      if (attachment.viewRole === 'MANAGER' && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
        throw new ForbiddenException('이 파일을 볼 권한이 없습니다.');
      }
    }

    return attachment;
  }

  async streamFile(attachment: any, res: Response) {
    return this.fileService.streamFile(attachment, res);
  }
}