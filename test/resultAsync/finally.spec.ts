import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('finally', () => {
    test('calls the projection with a successful ResultAsync', async () => {
      const value = 1;

      const sut = ResultAsync.success(value);

      const resultValue = await sut.finally((r) => r.getValueOrThrow());

      expect(resultValue).toBe(value);
    });

    test('calls the projection with a failed ResultAsync', async () => {
      const sut = ResultAsync.failure<number>('error');

      const resultFailure = await sut.finally((r) => r.getErrorOrThrow());

      expect(resultFailure).toBe('error');
    });
  });
});
