import { Test, TestingModule } from '@nestjs/testing';
import { UppercasePipe } from './uppercase.pipe';

describe('UppercasePipe', () => {
  let pipe: UppercasePipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UppercasePipe],
    }).compile();

    pipe = module.get<UppercasePipe>(UppercasePipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('transform should convert string to uppercase', () => {
    expect(pipe.transform('hello')).toBe('HELLO');
    expect(pipe.transform('world')).toBe('WORLD');
    expect(pipe.transform('NestJS')).toBe('NESTJS');
  });

  it('transform should handle mixed case', () => {
    expect(pipe.transform('HeLLo WoRLd')).toBe('HELLO WORLD');
  });

  it('transform should throw BadRequestException for non-string values', () => {
    expect(() => pipe.transform(123 as any)).toThrow(
      'UppercasePipe expects a string value',
    );
    expect(() => pipe.transform(null as any)).toThrow(
      'UppercasePipe expects a string value',
    );
    expect(() => pipe.transform({} as any)).toThrow(
      'UppercasePipe expects a string value',
    );
  });

  it('transform should handle empty string', () => {
    expect(pipe.transform('')).toBe('');
  });
});
