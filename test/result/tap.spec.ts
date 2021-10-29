import { Result } from '@/src/result';

describe('Result', () => {
  describe('tap', () => {
    test('will execute the given action if the Result is successful', () => {
      let wasCalled = false;
      const sut = Result.success(1);

      sut.tap(() => (wasCalled = true));

      expect(wasCalled).toBe(true);
    });

    test('will skip executing the given action if the Result is a failure', () => {
      let wasCalled = false;
      const sut = Result.failure<number>('error');

      sut.tap(() => (wasCalled = true));

      expect(wasCalled).toBe(false);
    });
  });
});
