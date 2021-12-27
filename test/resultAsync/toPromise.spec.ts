import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('toPromise', () => {
    test('returns a Promise containing the inner successful Result for a successful ResultAsync', async () => {
      const value = 1;

      const sut = ResultAsync.success(value);

      const innerResult = await sut.toPromise();

      expect(innerResult).toSucceedWith(value);
    });

    test('returns a Promise containing the inner failed Result for a failed ResultAsync', async () => {
      const error = 'error';
      const sut = ResultAsync.failure<number>(error);

      const innerResult = await sut.toPromise();

      expect(innerResult).toFailWith(error);
    });
  });
});
