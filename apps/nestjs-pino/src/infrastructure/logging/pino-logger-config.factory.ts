import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Params } from 'nestjs-pino';
import { Options } from 'pino-http';
import pkg from '../../../package.json';

/**
 * Factory function for Pino logger configuration
 * Used with LoggerModule.forRootAsync() to access ConfigService
 * Falls back to process.env if ConfigService is not provided
 */
export const pinoLoggerConfigFactory = (configService?: ConfigService): Params => {
  console.log('[pinoLoggerConfigFactory] Factory called');
  console.log('[pinoLoggerConfigFactory] ConfigService available:', !!configService);

  const serviceName = pkg.name;
  const environment = configService?.get<string>('runtime.environment') || 'development';
  const isProduction = environment === 'production';
  const logLevel = configService?.get<string>('runtime.logLevel') || 'info';
  const isLocalLogVerbose = configService?.get<string>('runtime.logLocalVerbose')?.toLowerCase() === 'true' || false;

  console.log('[pinoLoggerConfigFactory] Config completed - environment:', environment, 'logLevel:', logLevel);

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
    // Custom timestamp formatter to create 'timestamp' field (matches payfit/be)
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    // Use 'base' instead of 'name' - this sets base properties included in all logs
    // This matches payfit/be configuration and prevents [undefined] in bracket format
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
      singleLine: false, // Allow multi-line output for better readability
      ignore: 'pid,hostname',
    };

    // When not verbose, show minimal metadata (level, message, timestamp)
    // 'timestamp' is used (not 'time') - matches payfit/be configuration
    // 'message' is used because messageKey is set to 'message'
    // This matches payfit/be configuration
    // When verbose, show all fields
    if (!isLocalLogVerbose) {
      pinoPrettyOptions.include = 'level,name,message,timestamp';
    }

    pinoHttpOptions.transport = {
      target: 'pino-pretty',
      options: pinoPrettyOptions,
    };
  }

  const baseConfig: Params = {
    // Type assertion needed because TypeScript can't infer the exact Options type
    // but we know the structure is correct for nestjs-pino
    pinoHttp: pinoHttpOptions as unknown as Options,
  };

  console.log('[pinoLoggerConfigFactory] Config factory completed successfully');
  return baseConfig;
};

