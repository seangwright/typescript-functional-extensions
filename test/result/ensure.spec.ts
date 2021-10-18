import { Result } from '@/src/result';

describe('Result', () => {
  describe('ensure', () => {
    describe('error', () => {
      test('returns the existing result when the predicate is true', () => {
        const error = 'error';
        const value = 1;
        const sut = Result.success(value);

        expect(sut.ensure((_) => true, error)).toBe(sut);
      });
    });

    describe('creator', () => {
      test('returns the existing result when the predicate is true', () => {
        const error = 'error';
        const value = 1;
        const sut = Result.success(value);

        expect(
          sut.ensure(
            (_) => true,
            (num) => num + error
          )
        ).toBe(sut);
      });
    });
  });
});
