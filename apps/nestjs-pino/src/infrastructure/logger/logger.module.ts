import { Global, Module, OnModuleInit } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule, PinoLogger, Logger as PinoNestLogger, PARAMS_PROVIDER_TOKEN } from 'nestjs-pino';

import { BasePinoLogger } from './base-pino-logger';
import { ConfigService } from '@nestjs/config';
import { pinoLoggerConfigFactory } from './pino-logger-config.factory';
import type { Params } from 'nestjs-pino';

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
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => pinoLoggerConfigFactory(configService),
      inject: [ConfigService],
    }),
  ],
  providers: [BasePinoLogger],
  exports: [BasePinoLogger],
})
export class LoggerModule implements OnModuleInit {
  constructor() {
    console.log('[LoggerModule] LoggerModule constructor called');
  }

  onModuleInit() {
    console.log('[LoggerModule] LoggerModule onModuleInit called');
    console.log('[LoggerModule] Module fully initialized');
  }
}
