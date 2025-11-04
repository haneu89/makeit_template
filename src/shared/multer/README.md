# 파일 업로드 모듈

이 모듈은 파일 업로드와 관련된 공통 기능을 제공합니다.

## 주요 기능

### 1. 파일 저장 (FileService)

- `saveFile(file: Express.Multer.File)`: 파일을 저장하고 저장된 파일 정보를 반환
  - 저장 경로: `storage/YYYY/MM/DD/`
  - 파일명: 타임스탬프 + 랜덤 문자열 조합
  - 반환값: `{ savedName, realPath }`

- `deleteFile(realPath: string)`: 파일 삭제
  - 실제 파일 시스템에서 파일을 삭제

- `replaceFile(oldPath: string, newFile: Express.Multer.File)`: 파일 교체
  - 기존 파일 삭제 후 새 파일 저장
  - 반환값: `{ savedName, realPath }`

- `streamFile(attachment: any, res: Response)`: 파일 스트리밍
  - 파일을 스트림으로 전송
  - Range 요청 지원 (부분 다운로드)
  - 404 에러 시 SVG 이미지 반환

### 2. Multer 설정 (CustomMulterModule)

- 파일 저장 경로: 프로젝트 루트의 `storage` 디렉토리
- 파일명 생성 규칙:
  - 타임스탬프 인코딩 + 8~12자 랜덤 문자열
  - 안전한 URL 문자만 사용 (A-Z, a-z, 0-9, -, _)
- 중복 방지: 파일명 중복 시 재시도 (최대 5회)

## 사용 예시

```typescript
// 1. 모듈 임포트
import { CustomMulterModule } from '@/src/shared/multer/multer.module';
import { FileService } from '@/src/shared/multer/file.service';

// 2. 모듈 등록
@Module({
  imports: [CustomMulterModule],
  // ...
})

// 3. 서비스에서 사용
@Injectable()
export class YourService {
  constructor(private fileService: FileService) {}

  async uploadFile(file: Express.Multer.File) {
    const { savedName, realPath } = await this.fileService.saveFile(file);
    // DB에 파일 정보 저장
  }

  async streamFile(attachment: any, res: Response) {
    await this.fileService.streamFile(attachment, res);
  }
}
```

## 파일 저장 구조

```
storage/
├── 2024/
│   ├── 03/
│   │   ├── 20/
│   │   │   ├── 1748036229075-856612002.jpg
│   │   │   └── 1748036713487-454613993.png
│   │   └── 21/
│   │       └── ...
│   └── 04/
│       └── ...
└── 2025/
    └── ...
```

## 주의사항

1. 파일 업로드 시 반드시 `CustomMulterModule`을 임포트해야 합니다.
2. 파일 저장 경로는 프로젝트 루트의 `storage` 디렉토리를 기준으로 합니다.
3. 파일명은 URL 안전 문자만 사용하여 생성됩니다.
4. 파일 스트리밍 시 Range 요청을 지원하여 대용량 파일도 효율적으로 처리합니다. 