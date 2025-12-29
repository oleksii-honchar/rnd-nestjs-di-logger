/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, LoggerService, Scope, Logger } from '@nestjs/common';
import { storage, Store } from 'nestjs-pino/storage';
import { PinoLogger } from 'nestjs-pino';

/**
 * BasePinoLogger implements LoggerService using PinoLogger
 * Uses TRANSIENT scope so each service gets its own logger instance with its own context
 *
 * This is a complete implementation that wraps PinoLogger and provides all logger functionality
 */
@Injectable({ scope: Scope.TRANSIENT })
export class BasePinoLogger implements LoggerService {
  private prefix: string | undefined;
  private readonly pinoLogger = new Logger(BasePinoLogger.name) as unknown as PinoLogger;

  constructor({ logger }: { logger: PinoLogger }) {
    this.pinoLogger = logger;
  }
  /**
   * Set the context for this logger instance
   * Delegates to PinoLogger's built-in setContext method
   */
  setContext(context: string): void {
    this.pinoLogger.setContext(context);
  }

  /**
   * Set the prefix that will be prepended to all log messages
   * The prefix is applied to all log messages when set
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  /**
   * Format message with prefix if prefix is set
   * Handles Pino's pattern where first param can be metadata (object) and message is in optional params
   * @param message First parameter (could be object metadata or string message)
   * @param optionalParams Optional parameters (message string if first param is object)
   * @returns Formatted parameters array with prefix applied to message string
   */
  private formatMessage(message: any, ...optionalParams: any[]): [any, ...any[]] {
    if (!this.prefix) {
      return [message, ...optionalParams];
    }

    // If first param is an object (metadata) and second param is a string (message)
    if (typeof message === 'object' && message !== null && !Array.isArray(message)) {
      if (optionalParams.length > 0 && typeof optionalParams[0] === 'string') {
        return [message, `[${this.prefix}] ${optionalParams[0]}`, ...optionalParams.slice(1)];
      }
      return [message, ...optionalParams];
    }

    // If first param is a string (message)
    if (typeof message === 'string') {
      return [`[${this.prefix}] ${message}`, ...optionalParams];
    }

    return [message, ...optionalParams];
  }

  /**
   * Add metadata that will be included in all subsequent log calls
   * Uses PinoLogger's assign method with async local storage for request-scoped metadata
   */
  addMetadata(metadata: Record<string, unknown>): void {
    // Ensure storage is available for request-scoped metadata
    if (!storage.getStore()) {
      storage.enterWith(new Store(this.pinoLogger.logger));
    }
    this.pinoLogger.assign(metadata);
  }

  log(message: any, ...optionalParams: any[]): void {
    this.info(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this.trace(message, ...optionalParams);
  }

  trace(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.trace(formatted[0], ...formatted.slice(1));
  }

  debug(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.debug(formatted[0], ...formatted.slice(1));
  }

  info(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.info(formatted[0], ...formatted.slice(1));
  }

  warn(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.warn(formatted[0], ...formatted.slice(1));
  }

  error(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.error(formatted[0], ...formatted.slice(1));
  }

  fatal(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    this.pinoLogger.fatal(formatted[0], ...formatted.slice(1));
  }

  // Delegate other Logger methods to the underlying pino logger
  child(bindings: Record<string, unknown>): BasePinoLogger {
    const childLogger = this.pinoLogger.logger.child(bindings);
    return new BasePinoLogger({ logger: childLogger as unknown as PinoLogger });
  }

  bindings(): Record<string, unknown> {
    return this.pinoLogger.logger.bindings();
  }

  flush(): void {
    this.pinoLogger.logger.flush();
  }

  // Delegate Logger properties
  get level(): string {
    return this.pinoLogger.logger.level as string;
  }

  set level(value: string) {
    this.pinoLogger.logger.level = value;
  }

  get levelVal(): number {
    return this.pinoLogger.logger.levelVal;
  }

  get useOnlyCustomLevels(): boolean {
    return this.pinoLogger.logger.useOnlyCustomLevels;
  }
}

