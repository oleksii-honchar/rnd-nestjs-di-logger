/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, LoggerService, Scope, Logger, Inject } from '@nestjs/common';
import { storage, Store } from 'nestjs-pino/storage';
import { PARAMS_PROVIDER_TOKEN, Logger as Logger1, PinoLogger } from 'nestjs-pino';
import type { Params } from 'nestjs-pino';

@Injectable()
export class BasePinoLogger extends PinoLogger {
  private prefix: string | undefined;
  private params: Params;

  constructor(
    @Inject(PARAMS_PROVIDER_TOKEN) params: Params,
  ) {
    super(params);
    this.setContext(BasePinoLogger.name);
    this.params = params;
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
      storage.enterWith(new Store(super.logger));
    }
    super.assign(metadata);
  }

  log(message: any, ...optionalParams: any[]): void {
    this.info(message, ...optionalParams);
  }

  override trace(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    super.trace(formatted[0], ...formatted.slice(1));
  }

  override debug(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    super.debug(formatted[0], ...formatted.slice(1));
  }

  override info(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    super.info(formatted[0], ...formatted.slice(1));
  }

  override warn(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    super.warn(formatted[0], ...formatted.slice(1));
  }

  override error(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    super.error(formatted[0], ...formatted.slice(1));
  }

  override fatal(message: any, ...optionalParams: any[]): void {
    const formatted = this.formatMessage(message, ...optionalParams);
    super.fatal(formatted[0], ...formatted.slice(1));
  }

  child(): BasePinoLogger {
    return new BasePinoLogger(this.params);
  }

  // Delegate Logger properties
  get level(): string {
    return super.logger.level as string;
  }

  set level(value: string) {
    super.logger.level = value;
  }

  get levelVal(): number {
    return super.logger.levelVal;
  }

  get useOnlyCustomLevels(): boolean {
    return super.logger.useOnlyCustomLevels;
  }
}

