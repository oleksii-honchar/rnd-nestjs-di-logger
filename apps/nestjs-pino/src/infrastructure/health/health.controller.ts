import { Controller, Get, Logger } from '@nestjs/common';
import pkg from '../../../package.json';
import { InjectPinoLogger } from 'nestjs-pino';
import { BasePinoLogger } from '../logger/base-pino-logger';

/**
 * Health check controller
 * Returns service status and version information
 */
@Controller()
export class HealthController {
  constructor(@InjectPinoLogger(HealthController.name) private readonly logger: BasePinoLogger) {
    this.logger.info('HealthController initialized');
  }

  @Get('health')
  getHealth() {
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: pkg.name,
      version: pkg.version,
    };

    return response;
  }
}
