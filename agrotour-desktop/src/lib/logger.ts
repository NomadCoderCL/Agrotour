/**
 * Logger Utility
 * Logging consistente con nivel configurable
 */

import CONFIG from "../config/env";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  DEBUG: "#7c7c7c",
  INFO: "#0066cc",
  WARN: "#ff6600",
  ERROR: "#cc0000",
};

class Logger {
  private static minLevel: LogLevel = (() => {
    const level = CONFIG.LOG_LEVEL.toUpperCase() as LogLevel;
    return (LOG_LEVELS[level] !== undefined ? level : LogLevel.INFO) as LogLevel;
  })();

  private prefix: string;

  constructor(name: string) {
    this.prefix = `[${name}]`;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[Logger.minLevel];
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const color = LEVEL_COLORS[level];
    const prefix = `%c${this.prefix}%c ${timestamp}`;

    if (data !== undefined) {
      console.log(
        prefix,
        `color: ${color}; font-weight: bold;`,
        "color: #666;",
        message,
        data
      );
    } else {
      console.log(
        prefix,
        `color: ${color}; font-weight: bold;`,
        "color: #666;",
        message
      );
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      this.log(LogLevel.ERROR, message, {
        message: error.message,
        stack: error.stack,
      });
    } else {
      this.log(LogLevel.ERROR, message, error);
    }
  }

  group(name: string): void {
    console.group(`${this.prefix} ${name}`);
  }

  groupEnd(): void {
    console.groupEnd();
  }

  time(label: string): void {
    console.time(`${this.prefix} ${label}`);
  }

  timeEnd(label: string): void {
    console.timeEnd(`${this.prefix} ${label}`);
  }

  table(data: any): void {
    console.table(data);
  }
}

// Factory
export function getLogger(name: string): Logger {
  return new Logger(name);
}

// Global instance
export const logger = getLogger("Agrotour");

export default getLogger;
