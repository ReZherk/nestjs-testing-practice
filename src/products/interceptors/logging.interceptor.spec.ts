import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockLogger: any;

  const mockCallHandler: Partial<CallHandler> = {
    handle: jest.fn().mockReturnValue(
      new Observable(subscriber => {
        subscriber.next('response data');
        subscriber.complete();
      }),
    ),
  };

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log request method, URL, and response time', () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/products',
        }),
      }),
    };

    interceptor.intercept(
      mockExecutionContext as any,
      mockCallHandler as CallHandler,
    ).subscribe(() => {
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/^GET \/products - \d+ms$/),
      );
    });
  });

  it('should log POST requests', () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          url: '/products',
        }),
      }),
    };

    interceptor.intercept(
      mockExecutionContext as any,
      mockCallHandler as CallHandler,
    ).subscribe(() => {
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/^POST \/products - \d+ms$/),
      );
    });
  });

  it('should handle different URLs and methods', () => {
    const testCases = [
      { method: 'PATCH', url: '/products/1', expected: /^PATCH \/products\/1 - \d+ms$/ },
      { method: 'DELETE', url: '/products/1', expected: /^DELETE \/products\/1 - \d+ms$/ },
      { method: 'PUT', url: '/products/1', expected: /^PUT \/products\/1 - \d+ms$/ },
    ];

    testCases.forEach(tc => {
      mockLogger.log!.mockClear();

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ method: tc.method, url: tc.url }),
        }),
      };

      interceptor.intercept(
        mockExecutionContext as any,
        mockCallHandler as CallHandler,
      ).subscribe(() => {
        expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(tc.expected));
      });
    });
  });
});

