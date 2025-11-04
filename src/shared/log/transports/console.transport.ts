import { LogEntry, LogLevel, LogTransport } from '../log.types';

/**
 * Console transport for log output
 * Supports colored output for better readability
 */
export class ConsoleTransport implements LogTransport {
  private readonly enableColors: boolean;

  constructor(enableColors = true) {
    this.enableColors = enableColors;
  }

  log(entry: LogEntry): void {
    const { level, message, context, timestamp, metadata, trace } = entry;

    const timeStr = timestamp.toISOString();
    const contextStr = context ? `[${context}]` : '';
    const levelStr = this.formatLevel(level);

    let output = `${timeStr} ${levelStr} ${contextStr} ${message}`;

    if (metadata && Object.keys(metadata).length > 0) {
      output += `\n${this.formatMetadata(metadata)}`;
    }

    if (trace) {
      output += `\n${trace}`;
    }

    this.writeToConsole(level, output);
  }

  private formatLevel(level: LogLevel): string {
    if (!this.enableColors) {
      return `[${level}]`;
    }

    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';

    return `${color}[${level}]${reset}`;
  }

  private formatMetadata(metadata: Record<string, any>): string {
    try {
      return JSON.stringify(metadata, null, 2);
    } catch {
      return String(metadata);
    }
  }

  private writeToConsole(level: LogLevel, output: string): void {
    switch (level) {
      case LogLevel.ERROR:
        console.error(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }
}
