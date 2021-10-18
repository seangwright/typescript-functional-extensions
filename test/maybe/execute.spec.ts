import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('execute', () => {
    test('calls the provided function when the Maybe has a value', () => {
      const sut = Maybe.some(1);
      let wasCalled = false;

      sut.execute((_) => (wasCalled = true));

      expect(wasCalled).toBe(true);
    });

    test('performs no action when the Maybe has no value', () => {
      const sut = Maybe.none<number>();
      let wasCalled = false;

      sut.execute((_) => (wasCalled = true));

      expect(wasCalled).toBe(false);
    });
  });
});
