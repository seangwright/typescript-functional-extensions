import { Result } from '@/src/result';

describe('Result', () => {
  describe('tapIf', () => {
    test('will execute the given action if the Result is successful and the condition is true', () => {
      let wasCalled = false;
      const sut = Result.success(1);

      sut.tapIf(true, () => (wasCalled = true));

      expect(wasCalled).toBe(true);
    });

    test('will execute the given action if the Result is successful and the predicate returns true', () => {
      let wasCalled = false;
      const sut = Result.success(1);

      sut.tapIf(
        () => true,
        () => (wasCalled = true)
      );

      expect(wasCalled).toBe(true);
    });

    test('will skip executing the given action if the Result is a failure', () => {
      let wasCalled = false;
      const sut = Result.failure<number>('error');

      sut.tapIf(true, () => (wasCalled = true));

      expect(wasCalled).toBe(false);
    });

    test('will skip executing the given action if the Result is successful but the condition is false', () => {
      let wasCalled = false;
      const sut = Result.success(1);

      sut.tapIf(false, () => (wasCalled = true));

      expect(wasCalled).toBe(false);
    });

    test('will skip executing the given action if the Result is successful but the predicate returns false', () => {
      let wasCalled = false;
      const sut = Result.success(1);

      sut.tapIf(
        () => false,
        () => (wasCalled = true)
      );

      expect(wasCalled).toBe(false);
    });
  });
});
