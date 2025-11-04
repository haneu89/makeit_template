import * as fs from 'fs';
import * as path from 'path';
import {
  LogEntry,
  LogTransport,
  FileRotationOptions,
} from '../log.types';

/**
 * File transport with rotation support
 * Creates daily log files with automatic cleanup
 */
export class FileTransport implements LogTransport {
  private readonly logDir: string;
  private readonly options: Required<FileRotationOptions>;
  private currentDate: string;
  private writeStream: fs.WriteStream | null = null;

  constructor(
    logDir = './logs',
    options: FileRotationOptions = {},
  ) {
    this.logDir = logDir;
    this.options = {
      maxFiles: options.maxFiles || 30,
      maxSize: options.maxSize || '10m',
      datePattern: options.datePattern || 'YYYY-MM-DD',
    };

    this.currentDate = this.getCurrentDateString();
    this.ensureLogDirectory();
    this.initializeStream();

    // Auto-cleanup only if maxFiles > 0
    if (this.options.maxFiles > 0) {
      this.cleanupOldFiles();
    }
  }

  log(entry: LogEntry): void {
    const { level, message, context, timestamp, metadata, trace } = entry;

    // Check if we need to rotate the file (new day)
    const dateStr = this.getCurrentDateString();
    if (dateStr !== this.currentDate) {
      this.rotateFile(dateStr);
    }

    const timeStr = timestamp.toISOString();
    const contextStr = context ? `[${context}]` : '';

    let logLine = `${timeStr} [${level}] ${contextStr} ${message}`;

    if (metadata && Object.keys(metadata).length > 0) {
      logLine += ` ${JSON.stringify(metadata)}`;
    }

    if (trace) {
      logLine += `\n${trace}`;
    }

    this.writeToFile(logLine);
  }

  close(): void {
    if (this.writeStream) {
      this.writeStream.end();
      this.writeStream = null;
    }
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private initializeStream(): void {
    const filePath = this.getLogFilePath(this.currentDate);
    this.writeStream = fs.createWriteStream(filePath, { flags: 'a' });
  }

  private rotateFile(newDate: string): void {
    this.close();
    this.currentDate = newDate;
    this.initializeStream();

    // Auto-cleanup only if maxFiles > 0
    if (this.options.maxFiles > 0) {
      this.cleanupOldFiles();
    }
  }

  private writeToFile(logLine: string): void {
    if (this.writeStream) {
      this.writeStream.write(logLine + '\n');
    }
  }

  private getCurrentDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    // Simple implementation of YYYY-MM-DD pattern
    return `${year}-${month}-${day}`;
  }

  private getLogFilePath(dateStr: string): string {
    return path.join(this.logDir, `${dateStr}.log`);
  }

  private cleanupOldFiles(): void {
    try {
      const files = fs
        .readdirSync(this.logDir)
        .filter((file) => file.endsWith('.log'))
        .map((file) => ({
          name: file,
          path: path.join(this.logDir, file),
          mtime: fs.statSync(path.join(this.logDir, file)).mtime,
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Remove files beyond maxFiles limit
      if (files.length > this.options.maxFiles) {
        files.slice(this.options.maxFiles).forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error(`Failed to delete old log file: ${file.name}`, err);
          }
        });
      }
    } catch (err) {
      console.error('Failed to cleanup old log files:', err);
    }
  }
}
