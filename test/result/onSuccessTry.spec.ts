import { Result } from '@/src/result';

describe('Result', () => {
  describe('onSuccessTry', () => {
    test('will perform no action for a failed Result', () => {
      const error = 'ouch';
      const sut = Result.failure<number>(error);
      let wasCalled = false;

      expect(
        sut.onSuccessTry(
          (_v) => {
            wasCalled = true;
          },
          (_) => 'fail'
        )
      ).toFailWith(error);
      expect(wasCalled).toBe(false);
    });

    test('will execute the action for a successful Result', () => {
      let wasCalled = false;

      const sut = Result.success(1);

      expect(
        sut.onSuccessTry(
          (_v) => {
            wasCalled = true;
          },
          (_) => 'fail'
        )
      ).toSucceedWith(1);
      expect(wasCalled).toBe(true);
    });

    test('will execute the action and convert the thrown error for a successful Result', () => {
      let wasCalled = false;

      const sut = Result.success(1);

      expect(
        sut.onSuccessTry(
          (_v) => {
            wasCalled = true;

            throw new Error('boom');
          },
          (e) => (e instanceof Error ? e.message : 'fail')
        )
      ).toFailWith('boom');
      expect(wasCalled).toBe(true);
    });
  });
});
