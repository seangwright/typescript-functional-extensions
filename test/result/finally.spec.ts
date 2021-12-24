import { Result } from '@/src/result';

describe('Result', () => {
  describe('finally', () => {
    test('will execute the projection with a successful Result', () => {
      const sut = Result.success(1);

      expect(sut.finally((r) => r.getValueOrThrow())).toBe(1);
    });

    test('will execute the projection with a failed Result', () => {
      const error = 'error';
      const sut = Result.failure<number>(error);

      expect(sut.finally((r) => r.getErrorOrThrow())).toBe(error);
    });
  });
});
