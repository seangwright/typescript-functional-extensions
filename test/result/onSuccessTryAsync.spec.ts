import { Result } from '@/src/result';

describe('Result', () => {
  describe('onSuccessTryAsync', () => {
    test('will perform no action for a failed Result', async () => {
      const error = 'ouch';
      const sut = Result.failure<number>(error);
      let wasCalled = false;

      const innerResult = await sut
        .onSuccessTryAsync(
          (_v) => {
            wasCalled = true;

            return Promise.resolve();
          },
          (_) => 'fail'
        )
        .toPromise();

      expect(innerResult).toFailWith(error);
      expect(wasCalled).toBe(false);
    });

    test('will execute the action for a successful Result', async () => {
      let wasCalled = false;

      const sut = Result.success(1);

      const innerResult = await sut
        .onSuccessTryAsync(
          (_v) => {
            wasCalled = true;

            return Promise.resolve();
          },
          (_) => 'fail'
        )
        .toPromise();

      expect(innerResult).toSucceedWith(1);
      expect(wasCalled).toBe(true);
    });

    test('will execute the action and convert the thrown error for a successful Result', async () => {
      let wasCalled = false;

      const sut = Result.success(1);

      const innerResult = await sut
        .onSuccessTryAsync(
          () => {
            wasCalled = true;

            throw new Error('boom');
          },
          (e) => (e instanceof Error ? e.message : 'fail')
        )
        .toPromise();

      expect(innerResult).toFailWith('boom');
      expect(wasCalled).toBe(true);
    });
  });
});
