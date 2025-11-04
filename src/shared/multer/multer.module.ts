// multer.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { FileService } from './file.service';

/**
 * 파일 저장 기본 경로 설정
 * storage 디렉토리는 프로젝트 루트에 위치
 */
const storageDir = process.env.APP_DEBUG === 'true' ? path.join(__dirname, '..', '..', '..', '..', 'storage') : 'storage';

/**
 * 파일명 생성에 사용할 문자셋
 * 안전한 URL에 사용 가능한 문자들로 구성
 */
const FILENAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/**
 * 숫자를 base64와 유사한 방식으로 인코딩
 * @param number - 인코딩할 숫자
 * @returns 인코딩된 문자열
 */
function encodeNumber(number: number): string {
  const base = FILENAME_CHARS.length;
  let encoded = '';

  while (number) {
    encoded = FILENAME_CHARS[number % base] + encoded;
    number = Math.floor(number / base);
  }

  return encoded;
}

/**
 * 지정된 길이의 랜덤 문자열 생성
 * @param length - 생성할 문자열 길이
 * @returns 랜덤 문자열
 */
function generateRandomString(length: number): string {
  return Array.from(
    { length }, 
    () => FILENAME_CHARS[crypto.randomInt(FILENAME_CHARS.length)]
  ).join('');
}

/**
 * Multer 스토리지 설정
 */
const storage = multer.diskStorage({
  /**
   * 파일 저장 경로 설정
   * 년/월/일 형식의 하위 디렉토리 생성
   */
  destination: (req, file, cb) => {
    const now = new Date();
    const dir = path.join(
      storageDir,
      now.getFullYear().toString(),
      (now.getMonth() + 1).toString().padStart(2, '0'),
      now.getDate().toString().padStart(2, '0')
    );

    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  /**
   * 유니크한 파일명 생성
   * 타임스탬프 + 랜덤문자열 조합으로 중복 방지
   */
  filename: (req, file, cb) => {
    const generateUniqueFilename = (ext: string, retryCount = 0): string => {
      // 타임스탬프 인코딩 + 8~12자 랜덤 문자열
      const filename = encodeNumber(Date.now()) + 
                      generateRandomString(crypto.randomInt(8, 13)) + 
                      ext;

      const filePath = path.join(storageDir, filename);

      // 파일명 중복 체크 및 재시도
      if (fs.existsSync(filePath)) {
        if (retryCount < 5) {
          return generateUniqueFilename(ext, retryCount + 1);
        }
        throw new Error('고유한 파일명 생성 실패');
      }

      return filename;
    };

    const ext = path.extname(file.originalname);
    cb(null, generateUniqueFilename(ext));
  },
});

@Module({
  imports: [MulterModule.register({
    storage,
    limits: {
      fileSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10737418240'), // 10GB 기본값
      files: 10, // 한 번에 최대 10개 파일
      fieldSize: 2 * 1024 * 1024, // 2MB 필드 크기
    },
  })],
  providers: [FileService],
  exports: [MulterModule, FileService],
})
export class CustomMulterModule {}
