import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, BadRequestException, Req, UploadedFiles } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentDto } from '../../attachment/attachment.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Role, Roles } from '../../shared/jwt';
import type { Request } from 'express';

@Controller('admin/attachment')
@Roles(Role.ADMIN, Role.MANAGER) // ADMIN, MANAGER 모두 접근 가능
export class AttachmentController {
  constructor(private readonly service: AttachmentService) { }

  @Get()
  async index(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('searchTerm') searchTerm?: string,
    @Query('searchType') searchType?: string,
    @Query('fileTypes') fileTypes?: string,
  ) {
    // TODO: 실제 사용자 역할을 가져오는 로직으로 대체
    const userRole = 'ADMIN'; // 임시로 ADMIN으로 설정

    return this.service.getAttachments({
      page: page ? parseInt(page, 10) : undefined,
      perPage: perPage ? parseInt(perPage, 10) : undefined,
      sortField,
      sortOrder,
      searchTerm,
      searchType,
      fileTypes,
      userRole,
    });
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('파일이 업로드되지 않았습니다.');
      }

      // 파일명 디코딩 처리
      files.forEach(file => {
        try {
          const buffer = Buffer.from(file.originalname, 'binary');
          file.originalname = buffer.toString('utf8');
        } catch (e) {
          console.log(e);
          console.warn('파일명 디코딩 실패:', file.originalname);
        }
      });

      const results = await Promise.all(
        files.map(file =>
          this.service.createAttachment({
            fileName: file.originalname,
            mime: file.mimetype,
            fileSize: file.size,
            file,  // 파일 객체 자체를 전달
            storage: 'local'
          })
        )
      );

      return results.map(result => ({
        id: result.id,
        file_name: `${req.protocol}://${req.get('host')}/api/file/${result.savedName}`
      }));
    } catch (error: any) {
      console.error('File upload error:', error);
      throw new BadRequestException(error.message || '파일 업로드에 실패했습니다.');
    }
  }

  @Get(':attachment')
  async show(
    @Req() req: Request,
    @Param('attachment') attachment: string,
  ) {
    // TODO: 실제 사용자 역할을 가져오는 로직으로 대체
    const userRole = 'ADMIN'; // 임시로 ADMIN으로 설정

    const item = await this.service.getAttachment(attachment, userRole);
    return item;
  }

  @Put(':attachment')
  async update(@Param('attachment') attachment: string, @Body() updateAttachmentDto: AttachmentDto) {
    const updatedAttachment = await this.service.updateAttachment(attachment, updateAttachmentDto);
    return updatedAttachment;
  }

  @Delete(':attachment')
  async destroy(@Param('attachment') attachment: string) {
    await this.service.deleteAttachment(attachment);
    return { message: 'Attachment deleted successfully' };
  }

  @Put(':attachment/content')
  async updateContent(
    @Param('attachment') attachment: string,
    @Body('content') content: string,
  ) {
    await this.service.updateContent(attachment, content);
    return { message: 'Content updated successfully' };
  }

  @Put(':attachment/replace')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('attachment') attachment: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('파일이 업로드되지 않았습니다.');
      }

      // 파일명 디코딩 처리
      try {
        const buffer = Buffer.from(file.originalname, 'binary');
        file.originalname = buffer.toString('utf8');
      } catch (e) {
        console.log(e);
        console.warn('파일명 디코딩 실패:', file.originalname);
      }

      await this.service.replaceFile(
        attachment,
        file,
        req.protocol,
        req.get('host') ?? 'localhost:3000',
      );

      return { message: 'File replaced successfully' };
    } catch (error: any) {
      console.error('File replace error:', error);
      throw new BadRequestException(error.message || '파일 교체에 실패했습니다.');
    }
  }
}
