import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Params } from 'nestjs-pino';
import { Options } from 'pino-http';
import pkg from '../../../package.json';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Factory function for Pino logger configuration
 * Used with LoggerModule.forRootAsync() to access ConfigService
 */
export const pinoLoggerConfigFactory = (configService: ConfigService): Params => {
  const serviceName = pkg.name;
  const environment = configService.get<string>('runtime.environment') || 'development';
  const isProduction = environment === 'production';
  const logLevel = configService.get<string>('runtime.logLevel') || 'info';
  const isLocalLogVerbose = configService.get<string>('runtime.logLocalVerbose')?.toLowerCase() === 'true' || false;

  const pinoHttpOptions: {
    level: string;
    messageKey?: string;
    timestamp?: () => string;
    base?: Record<string, unknown>;
    serializers?: Record<string, unknown>;
    transport?: { target: string; options: Record<string, unknown> };
  } = {
    level: logLevel,
    messageKey: 'message',
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    base: {
      environment,
      service: serviceName,
    },
    serializers: {
      req: (request: Request) => ({
        method: request.method,
        url: request.url,
        path: request.url,
        parameters: request.params,
        machineId: request.headers?.['x-machine-id'],
        requestStartTimestamp: request.headers?.['x-request-start-timestamp'],
        requestHandleTimestamp: request.headers?.['x-request-handle-timestamp'],
      }),
      res: (response: Response) => ({
        statusCode: response.statusCode,
        responseTime: response.getHeader?.('x-response-time') || 0,
        totalTime: response.getHeader?.('x-total-time') || 0,
      }),
    },
  };

  // Development: use pino-pretty for readable logs
  if (!isProduction) {
    const pinoPrettyOptions: Record<string, unknown> = {
      colorize: true,
      messageKey: 'message',
      translateTime: 'yyyy-mm-dd HH:MM:ss', // Format timestamp (matches payfit/be)
      singleLine: false,
      ignore: 'pid,hostname',
    };

    if (!isLocalLogVerbose) {
      pinoPrettyOptions.include = 'level,name,message,timestamp';
    }

    pinoHttpOptions.transport = {
      // Use custom transport wrapper to support messageFormat function
      target: join(__dirname, 'pino-pretty-transport.js'),
      options: pinoPrettyOptions,
    };
  }

  const baseConfig: Params = {
    pinoHttp: pinoHttpOptions as unknown as Options,
  };

  console.log('[pinoLoggerConfigFactory] Config factory executed successfully');
  return baseConfig;
};

