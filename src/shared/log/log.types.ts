/**
 * Log module type definitions
 * Reusable across projects
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  trace?: string;
}

export interface HttpLogEntry extends LogEntry {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  ip?: string;
  userAgent?: string;
  userId?: number;
}

export interface FileRotationOptions {
  maxFiles?: number; // Maximum number of log files to keep (0 = no auto-delete)
  maxSize?: string; // Maximum size per file (e.g., '10m', '100k')
  datePattern?: string; // Date pattern for file names (default: 'YYYY-MM-DD')
}

export interface LogModuleOptions {
  level?: LogLevel;
  transports?: TransportType[];
  fileRotation?: FileRotationOptions;
  logDir?: string; // Directory for log files (default: './logs')
  excludePaths?: string[]; // HTTP paths to exclude from logging
  sentryDsn?: string;
  enableColors?: boolean;
}

export type TransportType = 'console' | 'file' | 'sentry';

export interface LogTransport {
  log(entry: LogEntry): void | Promise<void>;
  close?(): void | Promise<void>;
}

export const LOG_MODULE_OPTIONS = 'LOG_MODULE_OPTIONS';
