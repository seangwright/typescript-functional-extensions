import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('tapNone', () => {
    test('performs no action when the Maybe has a value', () => {
      const sut = Maybe.some(10);
      let val = 1;

      sut.tapNone(() => (val = -1));

      expect(val).toBe(1);
    });

    test('executes the action for Maybes with no value', () => {
      const sut = Maybe.none<number>();
      let val = 1;

      sut.tapNone(() => (val = -1));

      expect(val).toBe(-1);
    });
  });
});
