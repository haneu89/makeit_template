import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Response } from 'express';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class FileService {
  async saveFile(file: Express.Multer.File) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const savedName = `${uniqueSuffix}${ext}`;
    const now = new Date();
    const dir = path.join(
      process.cwd(),
      'storage',
      now.getFullYear().toString(),
      (now.getMonth() + 1).toString().padStart(2, '0'),
      now.getDate().toString().padStart(2, '0')
    );
    const realPath = path.join(dir, savedName);

    // 디렉토리가 없으면 생성
    fs.mkdirSync(dir, { recursive: true });

    // 파일 이동
    await fs.promises.copyFile(file.path, realPath);
    await fs.promises.unlink(file.path);  // 임시 파일 삭제

    return {
      savedName,
      realPath,
    };
  }

  async deleteFile(realPath: string) {
    if (fs.existsSync(realPath)) {
      await unlinkAsync(realPath);
    }
  }

  async replaceFile(oldPath: string, newFile: Express.Multer.File) {
    try {
      // 기존 파일 삭제
      if (fs.existsSync(oldPath)) {
        await unlinkAsync(oldPath);
      }

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = path.extname(newFile.originalname);
      const savedName = `${uniqueSuffix}${ext}`;
      const now = new Date();
      const dir = path.join(
        process.cwd(),
        'storage',
        now.getFullYear().toString(),
        (now.getMonth() + 1).toString().padStart(2, '0'),
        now.getDate().toString().padStart(2, '0')
      );
      const realPath = path.join(dir, savedName);

      // 디렉토리가 없으면 생성
      fs.mkdirSync(dir, { recursive: true });

      // 새 파일 이동
      await fs.promises.copyFile(newFile.path, realPath);
      await fs.promises.unlink(newFile.path);  // 임시 파일 삭제

      return {
        savedName,
        realPath,
      };
    } catch (error) {
      console.error('File replace error:', error);
      throw new BadRequestException('파일 교체 중 오류가 발생했습니다.');
    }
  }

  async streamFile(attachment: any, res: Response) {
    const filePath = attachment.realPath;

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'image/svg+xml' });
      return res.end(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#f8f9fa"/>
          <text x="50%" y="50%" text-anchor="middle" fill="#6c757d" font-size="16">
            파일을 찾을 수 없습니다
          </text>
        </svg>
      `);
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = res.req?.headers?.range;

    try {
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;

        const headers = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': attachment.mime,
          'Content-Disposition': `inline; filename=${encodeURIComponent(attachment.fileName)}`
        };

        res.writeHead(206, headers);
        fs.createReadStream(filePath, { start, end }).pipe(res);
      } else {
        const headers = {
          'Content-Length': fileSize,
          'Content-Type': attachment.mime,
          'Accept-Ranges': 'bytes',
          'Content-Disposition': `inline; filename=${encodeURIComponent(attachment.fileName)}`
        };

        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error) {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }
  }
} 