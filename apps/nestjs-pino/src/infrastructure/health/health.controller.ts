import { Controller, Get, Logger } from '@nestjs/common';
import pkg from '../../../package.json';

/**
 * Health check controller
 * Returns service status and version information
 */
@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor() {
    this.logger.log('HealthController initialized');
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
