import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  test('some constructs with a string value', () => {
    const sut = Maybe.some('val');

    expect(sut.hasNoValue).toBe(false);
    expect(sut.hasValue).toBe(true);
  });

  test('none constructs with no string value', () => {
    const sut = Maybe.none<string>();

    expect(sut.hasNoValue).toBe(true);
    expect(sut.hasValue).toBe(false);
  });

  describe('from', () => {
    test('constructs with a string value', () => {
      const sut = Maybe.from('val');

      expect(sut.hasNoValue).toBe(false);
      expect(sut.hasValue).toBe(true);
    });

    test('constructs with undefined', () => {
      const sut = Maybe.from<string>(undefined);

      expect(sut.hasNoValue).toBe(true);
      expect(sut.hasValue).toBe(false);
    });
  });
});
