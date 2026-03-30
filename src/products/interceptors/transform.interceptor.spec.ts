import { Test, TestingModule } from '@nestjs/testing';
import { TransformInterceptor } from './transform.interceptor';
import { CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  const mockCallHandler: Partial<CallHandler> = {
    handle: jest.fn().mockReturnValue(
      new Observable(subscriber => {
        subscriber.next({ data: 'test data' });
        subscriber.complete();
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();

    interceptor = module.get<TransformInterceptor<any>>(TransformInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform response to include status and timestamp', () => {
    const mockExecutionContext = {};

    const result$ = interceptor.intercept(
      mockExecutionContext as any,
      mockCallHandler as CallHandler,
    );

    let result;
    result$.subscribe(value => {
      result = value;
    });

    expect(result).toEqual({
      data: { data: 'test data' },
      status: 'success',
      timestamp: expect.any(String),
    });
  });

  it('should preserve original response data', () => {
    const mockData = { id: 1, name: 'Product' };
    const mockCallHandler2: Partial<CallHandler> = {
      handle: jest.fn().mockReturnValue(
        new Observable(subscriber => {
          subscriber.next(mockData);
          subscriber.complete();
        }),
      ),
    };

    const result$ = interceptor.intercept(
      {} as any,
      mockCallHandler2 as CallHandler,
    );

    let result;
    result$.subscribe(value => {
      result = value;
    });

    expect(result.data).toEqual(mockData);
  });

  it('should always set status to "success"', () => {
    const mockCallHandler3: Partial<CallHandler> = {
      handle: jest.fn().mockReturnValue(
        new Observable(subscriber => {
          subscriber.next('any data');
          subscriber.complete();
        }),
      ),
    };

    const result$ = interceptor.intercept(
      {} as any,
      mockCallHandler3 as CallHandler,
    );

    let result;
    result$.subscribe(value => {
      result = value;
    });

    expect(result.status).toBe('success');
  });

  it('should include timestamp in ISO format', () => {
    const result$ = interceptor.intercept(
      {} as any,
      mockCallHandler as CallHandler,
    );

    let result;
    result$.subscribe(value => {
      result = value;
    });

    expect(() => new Date(result.timestamp)).not.toThrow();
    expect(result.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
  });

  it('should handle null/undefined responses', () => {
    const mockCallHandler4: Partial<CallHandler> = {
      handle: jest.fn().mockReturnValue(
        new Observable(subscriber => {
          subscriber.next(null);
          subscriber.complete();
        }),
      ),
    };

    const result$ = interceptor.intercept(
      {} as any,
      mockCallHandler4 as CallHandler,
    );

    let result;
    result$.subscribe(value => {
      result = value;
    });

    expect(result.data).toBeNull();
    expect(result.status).toBe('success');
  });
});
