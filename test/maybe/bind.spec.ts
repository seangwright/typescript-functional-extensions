import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('bind', () => {
    test('converts the Maybes inner value to a new Maybe with a value', () => {
      const value = 1;
      const otherValue = 'hello';

      const sut = Maybe.some(value);

      expect(sut.bind((number) => Maybe.some(number + otherValue))).toHaveValue(
        `${value}${otherValue}`
      );
    });

    test('converts the Maybes inner value to a new Maybe with no value', () => {
      const value = 1;

      const sut = Maybe.some(value);

      expect(sut.bind((_) => Maybe.none<string>())).toHaveNoValue();
    });

    test('performs no action for Maybes with no value', () => {
      const sut = Maybe.none<number>();
      let wasCalled = false;

      expect(
        sut.bind((_) => {
          wasCalled = true;
          return Maybe.some('test');
        })
      ).toHaveNoValue();
    });
  });
});
