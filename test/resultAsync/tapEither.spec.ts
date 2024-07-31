import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('tapEither', () => {
    test('executes the action with a failed ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.failure<number>('error');

      const result = await sut
        .tapEither((_) => {
          wasCalled = true;
        })
        .toPromise();

      expect(result).toFailWith('error');
      expect(wasCalled).toBe(true);
    });

    test('executes the action with a successful ResultAsync', async () => {
      const value = 1;
      let wasCalled = false;

      const sut = ResultAsync.success(value);

      const result = await sut
        .tapEither((_) => {
          wasCalled = true;
        })
        .toPromise();

      expect(result).toSucceedWith(1);
      expect(wasCalled).toBe(true);
    });

    test('executes the async action with a successful ResultAsync', async () => {
      const value = 1;
      let wasCalled = false;

      const sut = ResultAsync.success(value);

      const result = await sut
        .tapEither((_) => {
          wasCalled = true;

          return Promise.resolve();
        })
        .toPromise();

      expect(result).toSucceedWith(1);
      expect(wasCalled).toBe(true);
    });

    test('executes the async action using the provided Result for a successful ResultAsync', async () => {
      const value = 1;
      let wasCalled = false;

      const sut = ResultAsync.success(value);

      const result = await sut
        .tapEither((res) => {
          wasCalled = res.isSuccess;

          return Promise.resolve();
        })
        .toPromise();

      expect(result).toSucceedWith(1);
      expect(wasCalled).toBe(true);
    });

    test('executes the async action using the provided Result for a failed ResultAsync', async () => {
      let wasCalled = false;

      const sut = ResultAsync.failure<number>('error');

      const result = await sut
        .tapEither((res) => {
          wasCalled = res.isFailure;
        })
        .toPromise();

      expect(result).toFailWith('error');
      expect(wasCalled).toBe(true);
    });
  });
});
