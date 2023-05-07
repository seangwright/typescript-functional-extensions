import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('tapEither', () => {
    test('executes the action with a failed ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.failure<number>('error');

      const result = await sut
        .tapEither(() => {
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
        .tapEither(() => {
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
        .tapEither(() => {
          wasCalled = true;

          return Promise.resolve();
        })
        .toPromise();

      expect(result).toSucceedWith(1);
      expect(wasCalled).toBe(true);
    });

    test('executes the async action with a failed ResultAsync', async () => {
      const error = 'error';
      let wasCalled = false;

      const sut = ResultAsync.failure(error);

      const result = await sut
        .tapEither(() => {
          wasCalled = true;

          return Promise.resolve();
        })
        .toPromise();

      expect(result).toFailWith(error);
      expect(wasCalled).toBe(true);
    });
  });
});
