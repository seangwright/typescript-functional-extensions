import { Result } from '@/src/result';

describe('Result', () => {
  describe('tapEither', () => {
    test('will execute the given action if the Result is successful', () => {
      let wasCalled = false;
      const sut = Result.success(1);

      sut.tapEither(() => (wasCalled = true));

      expect(wasCalled).toBe(true);
      expect(sut).toSucceedWith(1);
    });

    test('will execute the given action if the Result is a failure', () => {
      let wasCalled = false;
      const sut = Result.failure<number>('error');

      sut.tapEither(() => (wasCalled = true));

      expect(wasCalled).toBe(true);
      expect(sut).toFailWith('error');
    });
  });
});
