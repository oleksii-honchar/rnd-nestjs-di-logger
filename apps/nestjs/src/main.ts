import 'reflect-metadata'; // Required for NestJS decorator metadata

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

/**
 * Creates and configures the NestJS application
 * This function will be used to bootstrap the NestJS app
 * @returns Configured NestJS application instance
 */
export async function createNestApi() {
  const app = await NestFactory.create(AppModule);

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

    const logger = new Logger('Main');

    await app.listen(port, host);
    logger.log(`[Main] Application is running on port ${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

bootstrap();
