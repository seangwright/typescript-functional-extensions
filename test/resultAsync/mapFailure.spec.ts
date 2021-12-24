import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('mapFailure', () => {
    test('calls the projection, creates a successful ResultAsync, from a failed ResultAsync', async () => {
      const sut = ResultAsync.failure<string>('error');

      const result = await sut
        .mapFailure((error) => `map: ${error}`)
        .toPromise();

      expect(result).toSucceedWith(`map: error`);
    });

    test('does not call the projection with a successful ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.success(1);

      const result = await sut
        .mapFailure((_error) => {
          wasCalled = true;
          return 2;
        })
        .toPromise();

      expect(result).toSucceedWith(1);
      expect(wasCalled).toBe(false);
    });

    test('calls the projection returning a Promise, creates a successful ResultAsync, from a failed ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.failure<string>('error');

      const result = await sut
        .mapFailure((num) => {
          wasCalled = true;
          return Promise.resolve(`map: ${num}`);
        })
        .toPromise();

      expect(result).toSucceedWith('map: error');
      expect(wasCalled).toBe(true);
    });
  });
});
