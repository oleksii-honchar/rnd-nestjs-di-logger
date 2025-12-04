import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Health check module
 * Provides health check endpoint for service monitoring
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
