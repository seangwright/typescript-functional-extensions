import { Result } from '@/src/result';
import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('bind', () => {
    test('does not call the projection with a failed ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.failure<number>('error');

      const result = await sut
        .bind((num) => {
          wasCalled = true;
          return Result.success(num + 1);
        })
        .toPromise();

      expect(result).toFailWith('error');
      expect(wasCalled).toBe(false);
    });

    test('calls the projection returning a successful Result with a successful ResultAsync', async () => {
      const sut = ResultAsync.success(1);

      const result = await sut
        .bind((num) => Result.success(num + 1))
        .toPromise();

      expect(result).toSucceedWith(2);
    });

    test('calls the projection returning a failed Result with a successful ResultAsync', async () => {
      const sut = ResultAsync.success(1);

      const result = await sut
        .bind((_num) => Result.failure('error'))
        .toPromise();

      expect(result).toFailWith('error');
    });

    test('calls the projection returning a successful ResultAsync with a successful ResultAsync', async () => {
      const sut = ResultAsync.success(1);

      const result = await sut
        .bind((num) => ResultAsync.success(num + 1))
        .toPromise();

      expect(result).toSucceedWith(2);
    });

    test('calls the projection returning a failed ResultAsync with a successful ResultAsync', async () => {
      const sut = ResultAsync.success(1);

      const result = await sut
        .bind((_num) => ResultAsync.failure('error'))
        .toPromise();

      expect(result).toFailWith('error');
    });
  });
});
