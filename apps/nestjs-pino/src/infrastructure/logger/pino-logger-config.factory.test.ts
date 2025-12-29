import { ConfigService } from '@nestjs/config';
import { pinoLoggerConfigFactory } from './pino-logger-config.factory';

describe('pinoLoggerConfigFactory', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const values: Record<string, string> = {
          'runtime.environment': 'development',
          'runtime.logLevel': 'info',
        };
        return values[key] || defaultValue;
      }),
    } as unknown as ConfigService;
  });

  it('should create Pino config with service name', () => {
    const config = pinoLoggerConfigFactory(configService);

    // pinoHttp uses base property with service name, not name directly
    const pinoHttpOptions = config.pinoHttp as { base?: { service?: string }; level?: string };
    expect(pinoHttpOptions.base?.service).toBe('@voqaria/bff-service');
    expect(pinoHttpOptions.level).toBe('info');
  });

  it('should use default log level when not provided', () => {
    configService.get = jest.fn((key: string, defaultValue?: string) => {
      if (key === 'runtime.logLevel') return defaultValue;
      if (key === 'runtime.environment') return 'development';
      return defaultValue || 'info'; // Default to 'info'
    }) as unknown as jest.Mock;

    const config = pinoLoggerConfigFactory(configService);
    const pinoHttpOptions = config.pinoHttp as { level?: string };
    expect(pinoHttpOptions.level).toBe('info');
  });

  it('should include custom serializers for request and response', () => {
    const config = pinoLoggerConfigFactory(configService);

    const pinoHttpOptions = config.pinoHttp as { serializers?: { req?: unknown; res?: unknown } };
    expect(pinoHttpOptions.serializers).toBeDefined();
    expect(pinoHttpOptions.serializers?.req).toBeDefined();
    expect(pinoHttpOptions.serializers?.res).toBeDefined();
  });

  it('should use pino-pretty transport in development', () => {
    configService.get = jest.fn((key: string, defaultValue?: string) => {
      if (key === 'runtime.environment') return 'development';
      if (key === 'runtime.logLevel') return 'info';
      return defaultValue;
    }) as unknown as jest.Mock;

    const config = pinoLoggerConfigFactory(configService);

    const pinoHttpOptions = config.pinoHttp as { transport?: { target?: string } };
    expect(pinoHttpOptions.transport).toBeDefined();
    expect(pinoHttpOptions.transport?.target).toBe('pino-pretty');
  });

  it('should not use pino-pretty transport in production', () => {
    configService.get = jest.fn((key: string, defaultValue?: string) => {
      if (key === 'runtime.environment') return 'production';
      if (key === 'runtime.logLevel') return 'info';
      return defaultValue;
    }) as unknown as jest.Mock;

    const config = pinoLoggerConfigFactory(configService);

    const pinoHttpOptions = config.pinoHttp as { transport?: unknown };
    expect(pinoHttpOptions.transport).toBeUndefined();
  });
});
