import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  LogEntry,
  LogLevel,
  LogTransport,
  LogModuleOptions,
  HttpLogEntry,
  LOG_MODULE_OPTIONS,
} from './log.types';
import { ConsoleTransport } from './transports/console.transport';
import { FileTransport } from './transports/file.transport';
import { SentryTransport } from './transports/sentry.transport';

/**
 * Core logging service with multi-transport support
 * Supports console, file, and Sentry transports
 */
@Injectable()
export class LogService implements OnModuleDestroy {
  private readonly transports: LogTransport[] = [];
  private readonly minLevel: LogLevel;
  private readonly excludePaths: Set<string>;

  private readonly levelPriority = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
  };

  constructor(
    @Inject(LOG_MODULE_OPTIONS)
    private readonly options: LogModuleOptions,
  ) {
    this.minLevel = options.level || LogLevel.INFO;
    this.excludePaths = new Set(options.excludePaths || []);
    this.initializeTransports();
  }

  onModuleDestroy() {
    this.closeTransports();
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  /**
   * Log error message with optional stack trace
   */
  error(message: string, trace?: string, context?: string, metadata?: any): void {
    this.log(LogLevel.ERROR, message, context, metadata, trace);
  }

  /**
   * Log HTTP request/response
   */
  logRequest(
    request: Request,
    response: Response,
    duration: number,
  ): void {
    const { method, originalUrl, ip, headers } = request;
    const { statusCode } = response;
    const userAgent = headers['user-agent'];

    // Check if path should be excluded
    if (this.shouldExcludePath(originalUrl)) {
      return;
    }

    // Determine log level based on status code
    let level = LogLevel.INFO;
    if (statusCode >= 500) {
      level = LogLevel.ERROR;
    } else if (statusCode >= 400) {
      level = LogLevel.WARN;
    }

    const message = `${method} ${originalUrl} ${statusCode} ${duration}ms`;

    const httpEntry: HttpLogEntry = {
      level,
      message,
      context: 'HTTP',
      timestamp: new Date(),
      method,
      url: originalUrl,
      statusCode,
      duration,
      ip,
      userAgent,
      metadata: {
        method,
        url: originalUrl,
        statusCode,
        duration,
        ip,
        userAgent,
      },
    };

    this.writeToTransports(httpEntry);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: any,
    trace?: string,
  ): void {
    // Check if log level meets minimum threshold
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      metadata,
      trace,
    };

    this.writeToTransports(entry);
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private shouldExcludePath(path: string): boolean {
    return Array.from(this.excludePaths).some((excludePath) =>
      path.startsWith(excludePath),
    );
  }

  private writeToTransports(entry: LogEntry): void {
    this.transports.forEach((transport) => {
      try {
        transport.log(entry);
      } catch (err) {
        console.error('Failed to write to transport:', err);
      }
    });
  }

  private initializeTransports(): void {
    const transportTypes = this.options.transports || ['console'];

    transportTypes.forEach((type) => {
      try {
        switch (type) {
          case 'console':
            this.transports.push(
              new ConsoleTransport(this.options.enableColors !== false),
            );
            break;

          case 'file':
            this.transports.push(
              new FileTransport(
                this.options.logDir || './logs',
                this.options.fileRotation,
              ),
            );
            break;

          case 'sentry':
            if (this.options.sentryDsn) {
              this.transports.push(new SentryTransport(this.options.sentryDsn));
            }
            // No DSN = silently skip Sentry
            break;

          default:
            console.warn(`[LogService] Unknown transport type: ${type}`);
        }
      } catch (err) {
        console.error(`[LogService] Failed to initialize ${type} transport:`, err);
      }
    });

    if (this.transports.length === 0) {
      console.warn(
        '[LogService] No transports initialized, falling back to console',
      );
      this.transports.push(new ConsoleTransport());
    }
  }

  private async closeTransports(): Promise<void> {
    await Promise.all(
      this.transports.map((transport) =>
        transport.close ? transport.close() : Promise.resolve(),
      ),
    );
  }
}
