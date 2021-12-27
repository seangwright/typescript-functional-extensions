import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('tap', () => {
    test('does not call the action with a successful ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.success(1);

      const result = await sut
        .tapFailure((_num) => {
          wasCalled = true;
        })
        .toPromise();

      expect(result).toSucceedWith(1);
      expect(wasCalled).toBe(false);
    });

    test('calls the action with a failed ResultAsync', async () => {
      let wasCalled = false;

      const sut = ResultAsync.failure('error');

      const result = await sut
        .tapFailure((_num) => {
          wasCalled = true;
        })
        .toPromise();

      expect(result).toFailWith('error');
      expect(wasCalled).toBe(true);
    });

    test('calls the async action with a failed ResultAsync', async () => {
      let wasCalled = false;

      const sut = ResultAsync.failure('error');

      const result = await sut
        .tapFailure((_num) => {
          wasCalled = true;

          return Promise.resolve();
        })
        .toPromise();

      expect(result).toFailWith('error');
      expect(wasCalled).toBe(true);
    });
  });
});
