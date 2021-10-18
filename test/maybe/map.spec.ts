import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('map', () => {
    test('converts the Maybes inner value to another value', () => {
      const sut = Maybe.some(10);

      expect(sut.map((n) => n.toString())).toHaveValue('10');
    });

    test('performs no action for Maybes with no value', () => {
      const sut = Maybe.none<number>();
      let wasCalled = false;

      expect(
        sut.map((n) => {
          wasCalled = true;
          return n.toString();
        })
      ).toHaveNoValue();
      expect(wasCalled).toBe(false);
    });
  });
});
