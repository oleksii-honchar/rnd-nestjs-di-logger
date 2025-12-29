import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Health check module
 * Provides health check endpoint for service monitoring
 * LoggerModule is @Global() so BasePinoLogger is available without explicit import
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule { }
