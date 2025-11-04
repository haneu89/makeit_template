import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AttachmentDto, AttachmentResponseDto } from '../../attachment/attachment.dto';
import { FileService } from '../../shared/multer/file.service';
import * as fs from 'fs';
import { promisify } from 'util';
import * as path from 'path';

const unlinkAsync = promisify(fs.unlink);

interface GetAttachmentsParams {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  searchType?: string;
  fileTypes?: string;
  userRole?: 'ADMIN' | 'MANAGER' | 'USER';
}

@Injectable()
export class AttachmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) { }

  async getAttachments({
    page = 1,
    perPage = 10,
    sortField = 'id',
    sortOrder = 'desc',
    searchTerm = '',
    searchType = 'all',
    fileTypes = 'all',
    userRole = 'USER',
  }: GetAttachmentsParams) {
    const skip = (page - 1) * perPage;
    const take = perPage;

    // 검색 조건 설정
    let where: any = {};

    // 권한 체크 조건 추가
    where.OR = [
      { viewRole: null }, // 모든 사용자 가능
      { viewRole: 'USER' }, // 일반 사용자 이상 가능
      ...(userRole === 'MANAGER' || userRole === 'ADMIN' ? [{ viewRole: 'MANAGER' }] : []), // 관리자 이상 가능
      ...(userRole === 'ADMIN' ? [{ viewRole: 'ADMIN' }] : []), // 시스템관리자만 가능
    ];

    // 검색어 조건
    if (searchTerm) {
      where.AND = [
        {
          OR: searchType === 'all'
            ? [
              { fileName: { contains: searchTerm } },
              { mime: { contains: searchTerm } },
            ]
            : searchType === 'filename'
              ? [{ fileName: { contains: searchTerm } }]
              : [{ mime: { contains: searchTerm } }],
        },
      ];
    }

    // 파일 타입 필터링
    if (fileTypes !== 'all') {
      const typeArray = fileTypes.split(',');
      where.AND = [
        {
          OR: typeArray.map(type => {
            switch (type) {
              case 'image':
                return { mime: { startsWith: 'image/' } };
              case 'pdf':
                return { mime: { equals: 'application/pdf' } };
              case 'audio':
                return { mime: { startsWith: 'audio/' } };
              default:
                return {};
            }
          })
        }
      ];
    }

    // 정렬 조건 설정
    const orderBy = {
      [sortField]: sortOrder,
    };

    // 전체 레코드 수 조회
    const total = await this.prisma.attachment.count({ where });

    // 데이터 조회
    const items = await this.prisma.attachment.findMany({
      skip,
      take,
      where,
      orderBy,
    });

    return {
      data: items.map(item => AttachmentResponseDto.fromEntity(item)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async getAttachment(id: string, userRole: 'ADMIN' | 'MANAGER' | 'USER' = 'USER') {
    const item = await this.prisma.attachment.findFirst({ where: { id: Number(id) } });
    if (!item) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    // 권한 체크
    if (item.viewRole) {
      if (item.viewRole === 'ADMIN' && userRole !== 'ADMIN') {
        throw new ForbiddenException('이 파일을 볼 권한이 없습니다.');
      }
      if (item.viewRole === 'MANAGER' && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
        throw new ForbiddenException('이 파일을 볼 권한이 없습니다.');
      }
    }

    return AttachmentResponseDto.fromEntity(item);
  }

  async createAttachment(data: AttachmentDto) {
    if (!data.file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    const { savedName, realPath } = await this.fileService.saveFile(data.file);

    const newAttachment = await this.prisma.attachment.create({
      data: {
        fileName: data.fileName,
        fileSize: data.fileSize,
        mime: data.mime,
        savedName,
        realPath,
        storage: 'local',
      },
    });
    return AttachmentResponseDto.fromEntity(newAttachment);
  }

  async updateAttachment(id: string, data: AttachmentDto) {
    const updatedAttachment = await this.prisma.attachment.update({
      where: { id: Number(id) },
      data,
    });
    return AttachmentResponseDto.fromEntity(updatedAttachment);
  }

  async deleteAttachment(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: Number(id) },
    });

    if (!attachment) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    await this.fileService.deleteFile(attachment.realPath);

    await this.prisma.attachment.delete({
      where: { id: Number(id) },
    });

    return { success: true };
  }

  async updateContent(id: string, content: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: Number(id) },
    });

    if (!attachment) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    if (attachment.mime !== 'application/json') {
      throw new BadRequestException('JSON 파일만 수정할 수 있습니다.');
    }

    try {
      // JSON 유효성 검사
      JSON.parse(content);
      
      // 파일 저장
      await fs.promises.writeFile(attachment.realPath, content, 'utf8');
      
      return { success: true };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('유효하지 않은 JSON 형식입니다.');
      }
      throw new InternalServerErrorException('파일 저장 중 오류가 발생했습니다.');
    }
  }

  async replaceFile(
    id: string,
    file: Express.Multer.File,
    protocol: string,
    host: string,
  ) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: Number(id) },
    });

    if (!attachment) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    try {
      const { savedName, realPath } = await this.fileService.replaceFile(attachment.realPath, file);

      // 파일 정보 업데이트
      const updatedAttachment = await this.prisma.attachment.update({
        where: { id: Number(id) },
        data: {
          fileSize: file.size,
          mime: file.mimetype,
          savedName,
          realPath,
        },
      });

      return {
        id: updatedAttachment.id,
        file_name: `${protocol}://${host}/api/file/${updatedAttachment.savedName}`
      };
    } catch (error) {
      console.error('File replace error:', error);
      throw new InternalServerErrorException('파일 교체 중 오류가 발생했습니다.');
    }
  }
}
