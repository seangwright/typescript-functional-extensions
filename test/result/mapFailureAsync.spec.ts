import { Result } from '@/src/result';

describe('Result', () => {
  describe('mapFailureAsync', () => {
    test('will not execute the projection with a successful Result', async () => {
      const sut = Result.success(1);

      const innerResult = await sut
        .mapFailureAsync((_error) => Promise.resolve(2))
        .toPromise();

      expect(innerResult).toSucceedWith(1);
    });

    test('will execute the projection with a failed Result', async () => {
      const error = 'error';
      let wasCalled = false;
      const sut = Result.failure<number>(error);

      const innerResult = await sut
        .mapFailureAsync((_error) => {
          wasCalled = true;

          return Promise.resolve(2);
        })
        .toPromise();

      expect(innerResult).toSucceedWith(2);
      expect(wasCalled).toBe(true);
    });
  });
});
