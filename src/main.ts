import 'reflect-metadata';
import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express, { Request, Response, NextFunction } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import next from 'next';
import http from 'http';
import net from 'net';

/**
 * 포트 사용 가능 여부 확인 함수
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

/**
 * 사용 가능한 포트 찾기 함수
 */
async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    console.log(`⚠️  포트 ${port}이 이미 사용 중입니다. 다음 포트를 시도합니다...`);
    port++;
  }
  return port;
}

async function bootstrap() {
  const isDev = process.env.NODE_ENV === 'development';
  const initialPort = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const port = await findAvailablePort(initialPort);
  
  // CORS 허용 도메인 설정
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').filter(Boolean) || [];
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    // Next.js 앱 초기화
    const nextApp = next({ dev: isDev });
    const handle = nextApp.getRequestHandler();
    
    await nextApp.prepare();
    console.log('✅ Next.js 준비 완료');

    // Express 서버 생성
    const server = express();

    // HTTP 서버 생성
    const httpServer = http.createServer(server);

    // Body parser 크기 제한 설정 (raw-body for Presigned Upload)
    const uploadMaxSize = process.env.UPLOAD_MAX_SIZE || '10737418240'; // 10GB 기본값
    server.use(express.json({ limit: uploadMaxSize }));
    server.use(express.urlencoded({ limit: uploadMaxSize, extended: true }));

    // NestJS 앱 생성 - ExpressAdapter로 기존 Express 인스턴스 사용
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn', 'log'],
      bodyParser: false, // Express에서 이미 설정했으므로 비활성화
    });

    // Socket.IO 어댑터 설정
    app.useWebSocketAdapter(new IoAdapter(httpServer));

    // CORS 설정 - CORS_ALLOWED_ORIGINS 환경변수 기반
    app.enableCors({
      origin: (origin, callback) => {
        // 개발 환경에서는 모든 origin 허용
        if (isDevelopment) {
          callback(null, true);
          return;
        }
        
        // origin이 없는 경우 (같은 도메인 요청) 허용
        if (!origin) {
          callback(null, true);
          return;
        }
        
        // CORS_ALLOWED_ORIGINS에 설정된 도메인만 허용
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS 정책에 의해 차단됨: ${origin}`));
        }
      },
      credentials: true, // 쿠키 허용
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    });

    console.log('✅ CORS 설정 완료:', {
      환경: isDevelopment ? '개발' : '운영',
      허용도메인: isDevelopment ? '모든 도메인' : allowedOrigins.length > 0 ? allowedOrigins : '모든 도메인'
    });

    app.setGlobalPrefix("api");

    // Next.js 정적 파일 처리를 위한 미들웨어
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.url?.startsWith('/_next/static') || 
          req.url?.startsWith('/_next/webpack') ||
          req.url?.startsWith('/_next/image')) {
        return next();
      } else {
        return next();
      }
    });

    // 라우팅 미들웨어: API 요청과 페이지 요청 구분
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        // API 요청과 Socket.IO 요청은 NestJS가 처리
        return next();
      } else {
        // 페이지 요청은 Next.js가 처리
        return handle(req, res);
      }
    });

    // NestJS 초기화
    await app.init();
    console.log('✅ NestJS 준비 완료');

    // HTTP 서버 시작
    httpServer.listen(port, () => {
      if (port !== initialPort) {
        console.log(`🚀 서버가 http://localhost:${port} 에서 실행 중입니다 (포트 ${initialPort}에서 ${port}로 변경됨)`);
      } else {
        console.log(`🚀 서버가 http://localhost:${port} 에서 실행 중입니다`);
      }
    });

  } catch (error) {
    console.error('❌서버 시작 오류:', error);
    process.exit(1);
  }
}

bootstrap();