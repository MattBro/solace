/**
 * Simple logger utility for enterprise applications
 * In production, this would integrate with services like DataDog, New Relic, etc.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error?.message || error,
      stack: error?.stack
    };
    console.error(this.formatMessage('error', message, errorContext));
  }

  // Log API requests
  logRequest(method: string, path: string, params?: any): void {
    this.info(`API Request: ${method} ${path}`, { params });
  }

  // Log API responses
  logResponse(method: string, path: string, statusCode: number, duration: number): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this[level](`API Response: ${method} ${path}`, {
      statusCode,
      duration: `${duration}ms`
    });
  }

  // Log database queries (in development only)
  logQuery(query: string, params?: any[]): void {
    if (this.isDevelopment) {
      this.debug('Database Query', { query, params });
    }
  }
}

// Export singleton instance
export const logger = new Logger();