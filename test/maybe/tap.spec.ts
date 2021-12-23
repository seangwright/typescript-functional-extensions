import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('tap', () => {
    test('executes the Action when the Maybe has a value', () => {
      const sut = Maybe.some(10);
      let val = 1;

      sut.tap((number) => (val = number));

      expect(val).toBe(10);
    });

    test('performs no action for Maybes with no value', () => {
      const sut = Maybe.none<number>();
      let val = 1;

      sut.tap((number) => (val = number));

      expect(val).toBe(1);
    });
  });
});
