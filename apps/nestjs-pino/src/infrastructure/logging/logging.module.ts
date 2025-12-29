import { Global, Module, OnModuleInit } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { BasePinoLogger } from './base-pino-logger';

/**
 * Global logging module that provides BasePinoLogger
 * BasePinoLogger is now a concrete implementation that injects PinoLogger
 * Services should inject BasePinoLogger directly and call setContext() in constructor
 *
 * IMPORTANT: This module MUST be imported AFTER LoggerModule.forRoot() in AppModule
 * We also import LoggerModule here to ensure PinoLogger is available for injection
 */
@Global()
@Module({
  imports: [LoggerModule],
  providers: [BasePinoLogger],
  exports: [BasePinoLogger],
})
export class LoggingModule implements OnModuleInit {
  constructor() {
    console.log('[LoggingModule] LoggingModule constructor called');
  }

  onModuleInit() {
    console.log('[LoggingModule] LoggingModule onModuleInit called');
    console.log('[LoggingModule] Module fully initialized');
  }
}
