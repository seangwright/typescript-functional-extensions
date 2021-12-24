import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('tapIf', () => {
    test('does not call the action with a failed ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.failure<number>('error');

      const result = await sut
        .tapIf(true, (_num) => {
          wasCalled = true;
        })
        .toPromise();

      expect(result).toFailWith('error');
      expect(wasCalled).toBe(false);
    });

    test('does not call the action with a false condition', async () => {
      let wasCalled = false;
      const sut = ResultAsync.success(1);

      const result = await sut
        .tapIf(false, (_num) => {
          wasCalled = true;
        })
        .toPromise();

      expect(result).toSucceedWith(1);
      expect(wasCalled).toBe(false);
    });

    test('calls the action with a true condition and successful ResultAsync', async () => {
      const value = 1;
      let wasCalled = false;

      const sut = ResultAsync.success(value);

      const result = await sut
        .tapIf(true, (_num) => {
          wasCalled = true;
        })
        .toPromise();

      expect(result).toSucceedWith(1);
      expect(wasCalled).toBe(true);
    });

    test('calls the action with a true predicate and successful ResultAsync', async () => {
      const value = 1;
      let wasCalled = false;

      const sut = ResultAsync.success(value);

      const result = await sut
        .tapIf(
          () => true,
          (_num) => {
            wasCalled = true;

            return Promise.resolve();
          }
        )
        .toPromise();

      expect(result).toSucceedWith(1);
      expect(wasCalled).toBe(true);
    });
  });
});
