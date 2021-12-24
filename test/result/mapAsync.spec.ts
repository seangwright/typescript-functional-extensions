import { Result } from '@/src/result';

describe('Result', () => {
  describe('mapAsync', () => {
    test('will map to a new asynchronous value with a successful Result', async () => {
      const sut = Result.success(1);

      const result = await sut
        .mapAsync((num) => Promise.resolve(num + 1))
        .toPromise();

      expect(result).toSucceedWith(2);
    });

    test('will not execute the mapping with a failed Result', async () => {
      let wasCalled = false;
      const error = 'error';
      const sut = Result.failure<number>(error);

      const result = await sut
        .mapAsync((num) => {
          wasCalled = true;
          return Promise.resolve(num + 1);
        })
        .toPromise();

      expect(result).toFailWith(error);
      expect(wasCalled).toBe(false);
    });
  });
});
