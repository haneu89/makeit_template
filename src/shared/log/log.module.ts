import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogService } from './log.service';
import { LogInterceptor } from './log.interceptor';
import { LogModuleOptions, LOG_MODULE_OPTIONS, LogLevel } from './log.types';

/**
 * Global logging module with multi-transport support
 *
 * Usage:
 * ```typescript
 * LogModule.forRoot({
 *   level: LogLevel.INFO,
 *   transports: ['console', 'file'],
 *   fileRotation: { maxFiles: 30 },
 *   excludePaths: ['/health', '/metrics'],
 * })
 * ```
 */
@Global()
@Module({})
export class LogModule {
  /**
   * Register LogModule with configuration
   */
  static forRoot(options: LogModuleOptions = {}): DynamicModule {
    // Set defaults
    const finalOptions: LogModuleOptions = {
      level: options.level || LogLevel.INFO,
      transports: options.transports || ['console'],
      logDir: options.logDir || './logs',
      excludePaths: options.excludePaths || ['/health', '/metrics'],
      enableColors: options.enableColors !== false,
      fileRotation: options.fileRotation || {
        maxFiles: 30,
        maxSize: '10m',
        datePattern: 'YYYY-MM-DD',
      },
      sentryDsn: options.sentryDsn,
    };

    return {
      module: LogModule,
      providers: [
        {
          provide: LOG_MODULE_OPTIONS,
          useValue: finalOptions,
        },
        LogService,
        {
          provide: APP_INTERCEPTOR,
          useClass: LogInterceptor,
        },
      ],
      exports: [LogService],
    };
  }
}
