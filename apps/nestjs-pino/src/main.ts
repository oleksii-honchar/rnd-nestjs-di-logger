import 'reflect-metadata'; // Required for NestJS decorator metadata

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { BasePinoLogger } from './infrastructure/logger/base-pino-logger';

/**
 * Creates and configures the NestJS application
 * This function will be used to bootstrap the NestJS app
 * @returns Configured NestJS application instance
 */
export async function createNestApi() {
  // bufferLogs: true ensures logs are buffered until the logger is ready
  // This is required for proper logger substitution
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(BasePinoLogger);
  logger.setContext('Main');
  app.useLogger(logger);
  app.flushLogs();
  app.enableCors();
  app.enableShutdownHooks();

  return app;
}

/**
 * Bootstrap and start the NestJS application
 * This is the entry point when running the NestJS version
 */
async function bootstrap() {
  try {
    const app = await createNestApi();
    const configService = app.get(ConfigService);
    const port = configService.get<number>('runtime.port') ?? NaN;
    const host = configService.get<string>('runtime.host') ?? '0.0.0.0';

    const logger = app.get(BasePinoLogger);

    await app.listen(port, host);
    logger.log(`Application is running on port ${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

bootstrap();
