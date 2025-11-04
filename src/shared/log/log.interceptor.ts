import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LogService } from './log.service';

/**
 * HTTP request/response logging interceptor
 * Automatically logs all HTTP requests with duration and status code
 */
@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Only intercept HTTP requests
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logService.logRequest(request, response, duration);
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          // Set status code for error response
          if (!response.statusCode || response.statusCode === 200) {
            response.statusCode = error.status || 500;
          }

          this.logService.logRequest(request, response, duration);

          // Also log the error details
          this.logService.error(
            `Error handling ${request.method} ${request.originalUrl}: ${error.message}`,
            error.stack,
            'HTTP',
            {
              method: request.method,
              url: request.originalUrl,
              statusCode: response.statusCode,
              errorName: error.name,
            },
          );
        },
      }),
    );
  }
}
