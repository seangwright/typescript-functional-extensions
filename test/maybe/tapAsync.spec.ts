import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('tapAsync', () => {
    test('executes the async Action and transforms to a MaybeAsync when the Maybe has a value', () => {
      const sut = Maybe.some(10);
      let wasCalled = false;

      sut.tapAsync((_number) => {
        wasCalled = true;

        return Promise.resolve();
      });

      expect(wasCalled).toBe(true);
    });

    test('performs no action and transforms to a MaybeAsync with no value for for Maybes with no value', () => {
      const sut = Maybe.none<number>();
      let wasCalled = false;

      sut.tap((_number) => {
        wasCalled = true;

        return Promise.resolve();
      });

      expect(wasCalled).toBe(false);
    });
  });
});
