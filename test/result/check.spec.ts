import { Result } from '@/src/result';

describe('Result', () => {
  describe('check', () => {
    test('returns the current value for a successful Result and a successful check', () => {
      const sut = Result.success(1);

      expect(sut.check((num) => Result.success(num + 1))).toSucceedWith(1);
    });

    test('returns the check failure when the check returns a failed Result', () => {
      const error = 'error';
      const sut = Result.success(1);

      expect(sut.check((_) => Result.failure(error))).toFailWith(error);
    });

    test('returns the original failure with either a successful or failed check', () => {
      const error = 'error';
      const sut = Result.failure(error);

      expect(sut.check((u) => Result.success(1))).toFailWith(error);
      expect(sut.check((u) => Result.failure('bang'))).toFailWith(error);
    });
  });
});
