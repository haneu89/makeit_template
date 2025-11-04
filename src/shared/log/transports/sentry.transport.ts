import { LogEntry, LogLevel, LogTransport } from '../log.types';

/**
 * Sentry transport for error tracking
 * Optionally requires @sentry/node package
 *
 * Installation:
 * npm install @sentry/node
 */
export class SentryTransport implements LogTransport {
  private sentry: any = null;
  private readonly dsn: string;

  constructor(dsn: string) {
    this.dsn = dsn;
    this.initializeSentry();
  }

  log(entry: LogEntry): void {
    // Only log errors and warnings to Sentry
    if (entry.level !== LogLevel.ERROR && entry.level !== LogLevel.WARN) {
      return;
    }

    if (!this.sentry) {
      return;
    }

    try {
      const { message, context, metadata, trace } = entry;

      if (entry.level === LogLevel.ERROR) {
        const error = trace ? new Error(message) : new Error(message);
        if (trace) {
          error.stack = trace;
        }

        this.sentry.captureException(error, {
          contexts: {
            context: { name: context },
          },
          extra: metadata,
        });
      } else {
        // Warning
        this.sentry.captureMessage(message, {
          level: 'warning',
          contexts: {
            context: { name: context },
          },
          extra: metadata,
        });
      }
    } catch (err) {
      console.error('Failed to send log to Sentry:', err);
    }
  }

  async close(): Promise<void> {
    if (this.sentry) {
      await this.sentry.close(2000);
    }
  }

  private async initializeSentry(): Promise<void> {
    if (!this.dsn) {
      // No DSN = user doesn't want Sentry, silently skip
      return;
    }

    try {
      // Try to dynamically import @sentry/node
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Optional dependency, may not be installed
      const Sentry = await import('@sentry/node');

      Sentry.init({
        dsn: this.dsn,
        tracesSampleRate: 1.0,
      });

      this.sentry = Sentry;
      console.log('[SentryTransport] Initialized successfully');
    } catch (err) {
      console.warn(
        '[SentryTransport] @sentry/node not installed. To enable: npm install @sentry/node',
      );
    }
  }
}
