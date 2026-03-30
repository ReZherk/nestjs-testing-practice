import { Test, TestingModule } from '@nestjs/testing';
import { ParseBoolPipe } from './parse-bool.pipe';

describe('ParseBoolPipe', () => {
  let pipe: ParseBoolPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParseBoolPipe],
    }).compile();

    pipe = module.get<ParseBoolPipe>(ParseBoolPipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('transform should return true for various true representations', () => {
    expect(pipe.transform(true)).toBe(true);
    expect(pipe.transform('true')).toBe(true);
    expect(pipe.transform('TRUE')).toBe(true);
    expect(pipe.transform('1')).toBe(true);
  });

  it('transform should return false for various false representations', () => {
    expect(pipe.transform(false)).toBe(false);
    expect(pipe.transform('false')).toBe(false);
    expect(pipe.transform('FALSE')).toBe(false);
    expect(pipe.transform('0')).toBe(false);
  });

  it('transform should throw BadRequestException for invalid values', () => {
    expect(() => pipe.transform('yes' as any)).toThrow(
      'ParseBoolPipe expects a boolean value',
    );
    expect(() => pipe.transform(123 as any)).toThrow(
      'ParseBoolPipe expects a boolean value',
    );
    expect(() => pipe.transform('maybe' as any)).toThrow(
      'ParseBoolPipe expects a boolean value',
    );
    expect(() => pipe.transform(undefined as any)).toThrow(
      'ParseBoolPipe expects a boolean value',
    );
  });
});
