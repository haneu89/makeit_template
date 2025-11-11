import { Controller, Post, Get, UploadedFiles, UseInterceptors, Req, Param, BadRequestException, Res, UnauthorizedException } from '@nestjs/common';
import { Public } from '../shared/jwt';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AttachmentService } from './attachment.service';
import { JwtRoleService } from '../shared/jwt';

@Controller('file')
export class AttachmentController {
  constructor(
    private attachmentService: AttachmentService,
    private jwtRoleService: JwtRoleService,
  ) {}

  @Post('upload')
  @Public()
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
          this.attachmentService.saveAttachment(
            file,
            req.protocol,
            req.get('host') ?? 'localhost:3000',
          )
        )
      );

      // 응답 형식 변경
      return results.map(result => ({
        id: result.id,
        file_name: `/api/file/${result.savedName}`
      }));
    } catch (error: any) {
      console.error('File upload error:', error);
      throw new BadRequestException(error.message || '파일 업로드에 실패했습니다.');
    }
  }

  @Get(':key')
  @Public()
  async getFile(
    @Param('key') key: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let userRole: 'ADMIN' | 'MANAGER' | 'USER' = 'USER';

    // JWT 토큰 확인 - Bearer 헤더와 쿠키에서 모두 추출
    const token = this.extractTokenFromRequest(req);
    if (token) {
      try {
        const payload = await this.jwtRoleService.verifyToken(token);
        userRole = payload.role;
      } catch (error: any) {
        // 토큰이 유효하지 않은 경우 기본값(USER) 사용
        console.warn('🔑 Invalid token in file access:', error.message || error);
      }
    }

    const attachment = await this.attachmentService.findBySavedName(key, userRole);
    return this.attachmentService.streamFile(attachment, res);
  }

  /**
   * Authorization Bearer 헤더에서 JWT 토큰 추출
   */
  private extractTokenFromRequest(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
