import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface LogFile {
  filename: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

interface LogEntry {
  timestamp: string;
  level: string;
  context: string;
  message: string;
  metadata?: any;
}

interface LogFileContentResponse {
  filename: string;
  size: number;
  lines: number;
  entries: LogEntry[];
}

/**
 * 시스템 로그 서비스
 * storage/logs 디렉토리의 로그 파일 관리
 */
@Injectable()
export class SystemLogService {
  private readonly logDir: string;

  constructor() {
    this.logDir = process.env.LOG_DIR || './storage/logs';
  }

  /**
   * 로그 파일 목록 조회
   */
  async getLogFiles(): Promise<LogFile[]> {
    try {
      // 로그 디렉토리 확인
      if (!fs.existsSync(this.logDir)) {
        return [];
      }

      const files = fs.readdirSync(this.logDir);

      const logFiles: LogFile[] = files
        .filter((file) => file.endsWith('.log'))
        .map((filename) => {
          const filePath = path.join(this.logDir, filename);
          const stats = fs.statSync(filePath);

          return {
            filename,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
          };
        })
        .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()); // 최신순 정렬

      return logFiles;
    } catch (error) {
      console.error('Failed to read log files:', error);
      return [];
    }
  }

  /**
   * 로그 파일 내용 조회
   */
  async getLogFileContent(
    filename: string,
    options?: {
      search?: string;
      level?: string;
      limit?: number;
    },
  ): Promise<LogFileContentResponse> {
    // 파일명 검증 (경로 조작 방지)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Invalid filename');
    }

    const filePath = path.join(this.logDir, filename);

    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Log file not found');
    }

    try {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());

      // 로그 엔트리 파싱
      let entries: LogEntry[] = lines.map((line) => this.parseLogLine(line));

      // ⭐ 최신순 정렬 (역순)
      entries = entries.reverse();

      // 필터링: 레벨
      if (options?.level) {
        entries = entries.filter((entry) => entry.level === options.level);
      }

      // 필터링: 검색어
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        entries = entries.filter(
          (entry) =>
            entry.message.toLowerCase().includes(searchLower) ||
            entry.context?.toLowerCase().includes(searchLower),
        );
      }

      // 제한
      if (options?.limit && options.limit > 0) {
        entries = entries.slice(0, options.limit);
      }

      return {
        filename,
        size: stats.size,
        lines: lines.length,
        entries,
      };
    } catch (error) {
      console.error('Failed to read log file:', error);
      throw new BadRequestException('Failed to read log file');
    }
  }

  /**
   * 로그 라인 파싱
   * 형식: 2025-01-29T12:34:56.789Z [INFO] [Context] Message {...metadata}
   */
  private parseLogLine(line: string): LogEntry {
    // 정규식으로 파싱
    const regex = /^(\S+)\s+\[(\w+)\]\s+(?:\[([^\]]+)\]\s+)?(.+)$/;
    const match = line.match(regex);

    if (!match) {
      // 파싱 실패 시 원본 반환
      return {
        timestamp: '',
        level: 'UNKNOWN',
        context: '',
        message: line,
      };
    }

    const [, timestamp, level, context, rest] = match;

    // 메타데이터 추출 (JSON 형식)
    let message = rest;
    let metadata = undefined;

    try {
      // 마지막 JSON 객체 찾기
      const jsonMatch = rest.match(/\s(\{.+\})$/);
      if (jsonMatch) {
        metadata = JSON.parse(jsonMatch[1]);
        message = rest.substring(0, jsonMatch.index).trim();
      }
    } catch {
      // JSON 파싱 실패 시 무시
    }

    return {
      timestamp,
      level,
      context: context || '',
      message,
      metadata,
    };
  }
}
