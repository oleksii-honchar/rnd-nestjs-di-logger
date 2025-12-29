import { Injectable, Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import config from 'config';

import { HealthModule } from './infrastructure/health/health.module';
import { TestModule } from './infrastructure/test/test.module';
import { LoggerModule } from 'nestjs-pino';
import { pinoLoggerConfigFactory } from './infrastructure/logging/pino-logger-config.factory';
import { LoggingModule } from './infrastructure/logging/logging.module';

const runtimeConfig = registerAs('runtime', () => config.get('runtime'));

let shouldPrintConfiguration = true
/**
 * Service to print basic configuration on application bootstrap
 */
@Injectable()
class AppBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppBootstrapService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.logger.log('AppBootstrapService initialized');
  }

  onApplicationBootstrap(): void {
    if (!shouldPrintConfiguration) {
      return;
    }

    if (!this.configService) {
      this.logger.error('ConfigService not initialized');
      return;
    }

    this.logger.log('📋 Application Configuration:');
    this.logger.log(`  runtime.environment: ${this.configService.get<string>('runtime.environment', 'not set')}`);
    this.logger.log(`  runtime.port: ${this.configService.get<number>('runtime.port') ?? 'not set'}`);
    this.logger.log(`  runtime.logLevel: ${this.configService.get<string>('runtime.logLevel', 'not set')}`);
    this.logger.log(`  runtime.logLocalVerbose: ${this.configService.get<string>('runtime.logLocalVerbose', 'not set')}`);
    this.logger.log('');
    shouldPrintConfiguration = false;
  }
}

/**
 * Root application module for NestJS BFF service
 * This module will gradually replace the Fastify bootstrap
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: undefined,
      load: [runtimeConfig],
    }),
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => pinoLoggerConfigFactory(configService),
      inject: [ConfigService],
    }),
    // LoggerModule.forRoot(),
    LoggingModule,
    HealthModule,
    TestModule,
  ],
  providers: [
    {
      provide: AppBootstrapService,
      useFactory: (configService: ConfigService) => new AppBootstrapService(configService),
      inject: [ConfigService],
    },
  ],
})
export class AppModule { }
