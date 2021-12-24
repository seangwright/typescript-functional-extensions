import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('ensure', () => {
    test('calls the predicate and returns a successful Result with a successful ResultAsync', async () => {
      const value = 1;

      const sut = ResultAsync.success(value);

      const result = await sut.ensure((num) => num >= 1, 'error').toPromise();

      expect(result).toSucceedWith(value);
    });

    test('does not execute the predicate for a failed ResultAsync', async () => {
      const error = 'error';
      let wasCalled = false;

      const sut = ResultAsync.failure(error);

      const result = await sut
        .ensure((_val) => {
          wasCalled = true;

          return true;
        }, 'handled')
        .toPromise();

      expect(result).toFailWith(error);
      expect(wasCalled).toBe(false);
    });

    test('returns a ResultAsync with a successful Result and predicate that returns false with an error value', async () => {
      const value = 1;

      const sut = ResultAsync.success(value);

      const result = await sut.ensure((num) => num >= 2, 'error').toPromise();

      expect(result).toFailWith('error');
    });

    test('returns a ResultAsync with a successful Result and predicate that returns false with an error creator', async () => {
      const value = 1;

      const sut = ResultAsync.success(value);

      const result = await sut
        .ensure(
          (num) => num >= 2,
          (v) => `error ${v}`
        )
        .toPromise();

      expect(result).toFailWith('error 1');
    });
  });
});
