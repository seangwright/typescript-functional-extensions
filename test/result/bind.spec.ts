import { Result } from '@/src/result';

describe('Result', () => {
  describe('bind', () => {
    test('will execute the projection and return a successful Result with a successful Result', () => {
      const sut = Result.success(1);

      expect(sut.bind((num) => Result.success(num + 1))).toSucceedWith(2);
    });

    test('will execute the projection and return a failed Result with a successful Result', () => {
      const sut = Result.success(1);
      const error = 'oops!';

      expect(sut.bind((_num) => Result.failure<number>(error))).toFailWith(
        error
      );
    });

    test('will not execute the projection with a failed Result', () => {
      const error = 'error';
      let wasCalled = false;
      const sut = Result.failure<number>(error);

      expect(
        sut.bind((num) => {
          wasCalled = true;

          return Result.success(num + 1);
        })
      ).toFailWith(error);
      expect(wasCalled).toBe(false);
    });
  });
});
